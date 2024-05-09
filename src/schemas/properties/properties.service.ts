import { ModalsService } from "../modals/modals.service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";

import {
    foundRes,
    notFoundRes,
    newInstanceRes,
    deletedRes,
    errorRes,
    filterNullsObject,
    GetAllProps,
    CustomResponseType,
    filteredGetQuery,
    validateNewInstance,
} from "src/ravennest";

import { Property } from "../../entities/property.entity";
import { CreatePropertyDto } from "../../dto/properties/create-property.dto";
import { UpdatePropertyDto } from "../../dto/properties/update-property.dto";
import { PropertyFields } from "../../enums/tables-data.enum";

@Injectable()
export class PropertiesService {
    constructor(
        @InjectRepository(Property)
        private readonly propertyRepository: Repository<Property>,
        // ----- external services -----
        private readonly modalsService: ModalsService
    ) {}

    // --- Basic REST APIs ---

    async getProperties({
        sortBy = Object.values(PropertyFields)[0],
        reverse = false,
        page = 1,
        conditions,
    }: GetAllProps<PropertyFields>): Promise<CustomResponseType<Property[]>> {
        try {
            const findQuery = filteredGetQuery({
                sortBy,
                reverse,
                page,
                conditions,
            });

            if (findQuery.status !== 200) {
                return notFoundRes(findQuery.message);
            }

            const response = await this.propertyRepository.find(findQuery.data);

            return foundRes(
                response.length
                    ? "Properties have been found"
                    : "Properties list is empty",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async getPropertyById(id: string): Promise<CustomResponseType<Property>> {
        try {
            const response = await this.propertyRepository.findOneBy({ id });

            if (!response) return notFoundRes("Property does not exist");

            return foundRes("Property has been found", response);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async createProperty(
        createPropertyDto: CreatePropertyDto
    ): Promise<CustomResponseType<Property>> {
        try {
            // filter any nulls
            const filteredData =
                filterNullsObject<CreatePropertyDto>(createPropertyDto);
            // validate the provided fields
            await validateNewInstance({
                dto: CreatePropertyDto,
                data: filteredData,
            });
            // deconstruction
            const {
                // --- DUMMY_TABLE_NAME_CREATE ---
                modal: modalId,
                ...rest
            } = filteredData;

            const propertyObj = { ...rest };

            // --- Table ID check - create ---
            if (modalId) {
                const modal = await this.modalsService.getModalById(modalId);
                if (modal.status !== 200) {
                    return notFoundRes("Modal doesn't exist");
                }
                propertyObj["modal"] = modal.data;
            }

            // ----------------------

            // create the object and save it in the DB
            const newProperty = this.propertyRepository.create(propertyObj);
            const response = await this.propertyRepository.save(newProperty);
            // --- Post-response - create ---

            // ----------------------
            // return the response
            return newInstanceRes<Property>(
                "Property has been created successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async updateProperty(
        id: string,
        updatePropertyDto: UpdatePropertyDto
    ): Promise<CustomResponseType<UpdateResult>> {
        try {
            // filter any nulls
            const filteredData =
                filterNullsObject<UpdatePropertyDto>(updatePropertyDto);
            // validate the provided fields
            await validateNewInstance({
                dto: UpdatePropertyDto,
                data: filteredData,
            });
            // check if the id exists
            const property = await this.getPropertyById(id);
            if (!property) {
                return notFoundRes(`Property does not exist`);
            }
            // deconstruction
            const {
                // --- DUMMY_TABLE_NAME_UPDATE ---
                modal: modalId,
                ...rest
            } = filteredData;

            const propertyObj = { ...rest };

            // --- Table ID check - update ---
            if (modalId) {
                const modal = await this.modalsService.getModalById(modalId);
                if (modal.status !== 200) {
                    return notFoundRes("Modal doesn't exist");
                }
                propertyObj["modal"] = modal.data;
            }

            // ----------------------

            // create the object and save it in the DB
            const response = await this.propertyRepository.update(
                {
                    id,
                },
                propertyObj
            );
            // --- Post-response - update ---

            // ----------------------
            // return the response
            return newInstanceRes<UpdateResult>(
                "Property has been updated successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async deleteAllProperties(): Promise<CustomResponseType<DeleteResult>> {
        try {
            const response = await this.propertyRepository.query(
                `TRUNCATE TABLE "property" CASCADE;`
            );

            return deletedRes("Properties data are wiped out", response);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async deleteProperty(
        id: string
    ): Promise<CustomResponseType<DeleteResult>> {
        try {
            const response = await this.propertyRepository.delete(id);

            if (!response) {
                return notFoundRes("Property does not exist");
            }

            return deletedRes(
                "Property has been deleted successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    // --- Relational REST APIs ---
    async getPropertiesByModalId({
        id,
        sortBy = Object.values(PropertyFields)[0],
        reverse = false,
        page = 1,
    }: GetAllProps<PropertyFields> & { id: string }): Promise<
        CustomResponseType<Property[]>
    > {
        try {
            const findQuery = filteredGetQuery({
                whereQuery: { modal: { id } },
                sortBy,
                reverse,
                page,
            });
            if (findQuery.status !== 200) return notFoundRes(findQuery.message);

            const response = await this.propertyRepository.find(findQuery.data);

            return foundRes(
                response.length
                    ? "Properties have been found"
                    : "Properties list is empty",
                response
            );
        } catch (error) {
            return errorRes(error);
        }
    }
}
