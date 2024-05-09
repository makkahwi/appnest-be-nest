/* eslint-disable @typescript-eslint/no-unused-vars */
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
    CustomResponseType,
    emailValidator,
    errorRes,
    invalidRes,
    mailing,
    sendEmail,
    validRes,
} from "src/ravennest";
import { UsersService } from "src/schemas/users/users.service";
import { TokenPayload } from "src/types/token-payload.type";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly usersService: UsersService
    ) {}

    async validateToken(token: string): Promise<CustomResponseType<string>> {
        try {
            const decoded = this.jwtService.verify(token);
            if (!decoded) return invalidRes("Invalid token", token);

            const { exp, iat, userId } = decoded;

            if (exp - iat < 0) return invalidRes("Token has expired!", token);

            const userToken = await this.usersService.getTokenById(userId);
            if (userToken.data !== token) {
                return invalidRes("Invalid token", token);
            }

            return validRes("Token is valid", decoded);
        } catch (error) {
            return errorRes(`Token is invalid: ${error.message}`);
        }
    }

    async logIn(
        identifier: string,
        password: string
    ): Promise<CustomResponseType<string>> {
        try {
            const user = await this.usersService.checkUserCredentials({
                identifier: {
                    type: emailValidator(identifier) ? "email" : "username",
                    value: identifier,
                },
                password,
            });

            if (user.status !== 200) {
                return { ...user, data: null };
            }

            const { password: userPass, id, token, ...rest } = user.data;

            const payload: TokenPayload = {
                userId: id,
                ...rest,
            };

            return validRes(
                "Token has been generated",
                await this.jwtService.signAsync(payload)
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async requestPasswordReset(
        identifier: string
    ): Promise<CustomResponseType<string>> {
        try {
            const user = await this.usersService.checkUserCredentials({
                identifier: {
                    type: emailValidator(identifier) ? "email" : "username",
                    value: identifier,
                },
                isOnlyEmail: true,
            });

            if (user.status !== 200) {
                return { ...user, data: null };
            }

            const token = await this.jwtService.signAsync({
                userId: user.data.id,
                email: user.data.email,
            });

            const updateResponse = await this.usersService.updateToken(
                identifier,
                token
            );
            if (updateResponse.status === 500)
                throw new Error("Couldn't update the token");

            const response = await sendEmail(
                mailing.passwordRequest(
                    user.data.email,
                    process.env.ENVIRONMENT,
                    token
                ),
                this.mailerService
            );

            return response;
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async resetPassword(
        identifier: string,
        newPassword: string,
        token: string
    ): Promise<CustomResponseType<any>> {
        try {
            const response = await this.validateToken(token);
            if (response.status !== 200)
                return invalidRes(response.message, response.data);

            return await this.usersService.updatePassword(
                identifier,
                newPassword
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }
}
