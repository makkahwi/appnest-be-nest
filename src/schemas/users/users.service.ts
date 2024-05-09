/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { compare, hash } from "bcrypt";
import { Request } from "express";

import {
    CustomResponseType,
    filterNullsObject,
    FilteredTermDataType,
    GetAllProps,
    foundRes,
    notFoundRes,
    deletedRes,
    errorRes,
    FilterOperator,
    forbiddenRes,
    filteredGetQuery,
    validateNewInstance,
    newInstanceRes,
    emailValidator,
} from "src/ravennest";

import { User } from "src/entities/user.entity";
import { CreateUserDto } from "src/dto/users/create-user.dto";
import { UpdateUserDto } from "src/dto/users/update-user.dto";
import { TablesNames, UserFields } from "src/enums/tables-data.enum";
import { FullTokenPayload } from "src/types/token-payload.type";
import { UserRole } from "src/enums/users.enum";
import { S3Service } from "src/aws/aws.service";
import { PasswordDto } from "src/dto/users/login-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        // ----- external services -----
        private readonly s3Service: S3Service
    ) {}

    // --- helper methods ---

    async checkUserCredentials({
        identifier,
        password = "",
        isOnlyEmail = false,
    }: {
        identifier: { type: "email" | "username"; value: string };
        password?: string;
        isOnlyEmail?: boolean;
    }): Promise<CustomResponseType<User>> {
        try {
            const response = await this.getUsers({
                withPass: true,
                conditions: [
                    {
                        filteredTerm: {
                            dataType: FilteredTermDataType.STRING,
                            value: identifier.value,
                        },
                        filterOperator: FilterOperator.STRING_EQUALS,
                        field:
                            identifier.type === "email"
                                ? UserFields.EMAIL
                                : UserFields.USERNAME,
                    },
                ],
            });

            if (!response?.data?.length) {
                return notFoundRes("Email does not exist");
            }

            const user: User = response.data[0];

            if (isOnlyEmail) {
                return foundRes("User has been found", user);
            }
            if (!(await compare(password, user?.password))) {
                return forbiddenRes("Invalid password");
            }

            return foundRes("User has been found", user);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    private checkForUniqueness = async (
        items: {
            field: UserFields;
            filteredTerm: {
                dataType: FilteredTermDataType;
                value: any;
            };
            filterOperator: FilterOperator;
        }[]
    ) => {
        const result: any[] = [];

        await Promise.all(
            items.map(async (item) => {
                if (!item) return;

                const obj = await this.getUsers({
                    conditions: [item],
                });

                if (obj?.data.length > 0) {
                    result.push(item.field);
                }
            })
        );

        if (result.length > 0) {
            throw new Error(`${result[0]} is already assigned to another user`);
        }
    };

    private userDataFilter<returnType>(user: User): returnType {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, token, ...rest } = user;
        return rest as returnType;
    }

    private uniqueFieldsArray = ({
        username,
        email,
        phoneNumber,
    }: {
        username: string;
        email: string;
        phoneNumber: string;
    }) => [
        {
            field: UserFields.USERNAME,
            filteredTerm: {
                dataType: FilteredTermDataType.STRING,
                value: username,
            },
            filterOperator: FilterOperator.STRING_EQUALS,
        },
        {
            field: UserFields.EMAIL,
            filteredTerm: {
                dataType: FilteredTermDataType.STRING,
                value: email,
            },
            filterOperator: FilterOperator.STRING_EQUALS,
        },
        phoneNumber && phoneNumber !== ""
            ? {
                  field: UserFields.PHONE_NUMBER,
                  filteredTerm: {
                      dataType: FilteredTermDataType.STRING,
                      value: phoneNumber,
                  },
                  filterOperator: FilterOperator.STRING_EQUALS,
              }
            : null,
    ];

    getUserTokenData(req: Request): FullTokenPayload | null {
        if (req) {
            if (Object.keys(req["user"]).length === 0) {
                return null;
            }

            const userTokenData = {
                ...req["user"],
            } as FullTokenPayload;

            userTokenData["expiredIn"] = `${Math.floor(
                (userTokenData.exp - userTokenData.iat) / 3600
            )} Hours`;

            return userTokenData;
        } else {
            throw new Error("Request is invalid");
        }
    }

    // --- REST APIs ---

    async getUsers({
        sortBy = UserFields.USERNAME,
        reverse = false,
        page = 1,
        withPass = false,
        conditions = [],
    }: GetAllProps<UserFields> & { withPass?: boolean }): Promise<
        CustomResponseType<User[]>
    > {
        try {
            const findQuery = filteredGetQuery({
                conditions,
                sortBy,
                page,
                reverse,
            });
            if (findQuery.status !== 200) {
                return notFoundRes(findQuery.message);
            }
            const response = await this.userRepository.find(findQuery.data);
            // remove the password from all the users before sending response
            const updatedUsers = response.map((user) => {
                return withPass ? user : this.userDataFilter<User>(user);
            });
            return foundRes<User[]>(
                response.length
                    ? "Users have been found"
                    : "Users list is empty",
                updatedUsers
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async getUserById(id: string): Promise<CustomResponseType<User>> {
        try {
            const response = await this.userRepository.findOneBy({ id });
            if (!response) return notFoundRes("User doesn't exist");

            return foundRes<User>(
                "User has been found",
                this.userDataFilter<User>(response)
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async getTokenById(id: string): Promise<CustomResponseType<string>> {
        try {
            const response = await this.userRepository.findOneBy({ id });
            if (!response) {
                return notFoundRes("User doesn't exist");
            }
            return foundRes<string>("Token has been found", response?.token);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async createUser(
        createUserDto: CreateUserDto,
        userTokenData: FullTokenPayload
    ): Promise<CustomResponseType<User>> {
        try {
            // filter any nulls
            const filteredData =
                filterNullsObject<CreateUserDto>(createUserDto);
            // validate the provided fields
            await validateNewInstance({
                dto: CreateUserDto,
                data: filteredData,
            });
            // deconstruction
            const { password, avatar, ...rest } = filteredData;
            // prevent the non-admins from creating an admin account
            if (
                filteredData.role === UserRole.ADMIN &&
                (!userTokenData || userTokenData.role === UserRole.MEMBER)
            ) {
                return forbiddenRes(
                    "Unauthorized entrance, you must be an admin to create another admin account"
                );
            }
            // check the unique fields
            await this.checkForUniqueness(
                this.uniqueFieldsArray({
                    username: filteredData.username,
                    email: filteredData.email,
                    phoneNumber: filteredData.phoneNumber,
                })
            );
            // create the object and save it in the DB
            const newUser = this.userRepository.create({
                ...rest,
                avatar: avatar?.filename || "",
                password: await hash(password, 12),
            });
            const response = await this.userRepository.save(newUser);
            // save the image on the AWS-S3 bucket
            avatar?.filename &&
                (await this.s3Service.uploadImage(avatar, TablesNames.USERS));
            // return the response
            return newInstanceRes<User>(
                "User has been created successfully",
                this.userDataFilter<User>(response)
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async updateUser(
        id: string,
        updateUserDto: UpdateUserDto,
        userTokenData: FullTokenPayload
    ): Promise<CustomResponseType<UpdateResult>> {
        try {
            // filter any nulls
            const filteredData =
                filterNullsObject<UpdateUserDto>(updateUserDto);
            // validate the provided fields
            await validateNewInstance({
                dto: UpdateUserDto,
                data: filteredData,
            });
            // check if the object is empty
            if (Object.keys(filteredData).length === 0)
                return errorRes(
                    "Invalid request body: you have to specify at least one attribute"
                );
            // check if the user is an admin
            const isAdminAccount =
                userTokenData && userTokenData.role === UserRole.ADMIN;
            // check if the id exists
            const user = await this.getUserById(id);
            if (user.status !== 200) {
                return notFoundRes("User doesn't exist");
            }
            // deconstruction
            const { avatar, ...rest } = filteredData;
            // prevent the non-admins from:
            // - updating their account roles
            // - changing their passwords from here
            // - changing others' data
            if (!isAdminAccount) {
                if (filteredData.role) {
                    return forbiddenRes(
                        "Unauthorized entrance, you must be an admin to update your role"
                    );
                }
                if (filteredData.password) {
                    return forbiddenRes(
                        "Unauthorized entrance, non-admins are not allowed to change your password from this endpoint"
                    );
                }
                if (userTokenData.userId !== id) {
                    return forbiddenRes(
                        "Unauthorized entrance, non-admins are only allowed to update their accounts"
                    );
                }
            }
            // check the unique fields
            await this.checkForUniqueness(
                this.uniqueFieldsArray({
                    username: filteredData.username,
                    email: filteredData.email,
                    phoneNumber: filteredData.phoneNumber,
                })
            );
            // create the object and save it in the DB
            const userUpdate = { ...rest };
            avatar?.filename && (userUpdate["avatar"] = avatar.filename);
            const response = await this.userRepository.update(
                {
                    id,
                },
                userUpdate
            );
            // save the new image on the AWS-S3 bucket and delete the old one
            if (avatar?.filename) {
                await this.s3Service.uploadImage(avatar, TablesNames.USERS);
                await this.s3Service.deleteImage(
                    avatar.filename,
                    TablesNames.USERS
                );
            }
            // return the response
            return newInstanceRes<UpdateResult>(
                "User has been updated successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async updatePassword(
        identifier: string,
        newPassword: string
    ): Promise<CustomResponseType<UpdateResult>> {
        try {
            const user = await this.checkUserCredentials({
                identifier: {
                    type: emailValidator(identifier) ? "email" : "username",
                    value: identifier,
                },
                isOnlyEmail: true,
            });
            if (user.status !== 200) {
                return { ...user, data: null };
            }
            // validate the provided fields
            await validateNewInstance({
                dto: PasswordDto,
                data: {
                    password: newPassword,
                },
            });

            const response = await this.userRepository.update(
                {
                    id: user.data.id,
                },
                {
                    password: await hash(newPassword, 12),
                    token: "",
                }
            );

            return newInstanceRes<UpdateResult>(
                "Password has been updated successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async updateToken(
        identifier: string,
        token: string
    ): Promise<CustomResponseType<UpdateResult>> {
        const user = await this.checkUserCredentials({
            identifier: {
                type: emailValidator(identifier) ? "email" : "username",
                value: identifier,
            },
            isOnlyEmail: true,
        });
        if (user.status !== 200) {
            return { ...user, data: null };
        }

        const response = await this.userRepository.update(
            {
                id: user.data.id,
            },
            {
                token,
            }
        );

        return newInstanceRes<UpdateResult>(
            "Password has been updated successfully",
            response
        );
    }

    async deleteAllUsers(): Promise<CustomResponseType<any>> {
        try {
            // gat the images' names to delete them from the S3 bucker
            const avatars = await this.s3Service.getAllImages(
                TablesNames.USERS
            );
            // delete users from the DB
            const response = await this.userRepository.query(
                `TRUNCATE TABLE "user" CASCADE;`
            );
            // delete the related avatars from the bucket
            avatars.data.length > 0 &&
                (await this.s3Service.bulkDelete(
                    avatars.data,
                    TablesNames.USERS
                ));
            // return the response
            return deletedRes<any>("Users data are wiped out", response);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async deleteUser(
        id: string,
        userTokenData: FullTokenPayload
    ): Promise<CustomResponseType<DeleteResult>> {
        try {
            // check if the user exists
            const user = await this.getUserById(id);
            if (user.status !== 200) {
                return notFoundRes("User doesn't exist");
            }
            // prevent non-admins from deleting others' accounts
            if (
                userTokenData.userId !== id &&
                userTokenData.role !== UserRole.ADMIN
            ) {
                return forbiddenRes(
                    "Unauthorized entrance, you're only allowed to delete your account"
                );
            }
            // delete the user form the DB
            const response = await this.userRepository.delete(id);
            // delete the related avatars from the bucket
            user.data?.avatar &&
                (await this.s3Service.deleteImage(
                    user.data.avatar,
                    TablesNames.USERS
                ));
            // return the response
            return deletedRes<DeleteResult>(
                "User has been deleted successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }
}
