import { ProjectsService } from "../projects/projects.service";
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

import { Modal } from "../../entities/modal.entity";
import { CreateModalDto } from "../../dto/modals/create-modal.dto";
import { UpdateModalDto } from "../../dto/modals/update-modal.dto";
import { ModalFields } from "../../enums/tables-data.enum";

@Injectable()
export class ModalsService {
    constructor(
        @InjectRepository(Modal)
        private readonly modalRepository: Repository<Modal>,
        // ----- external services -----
        private readonly projectsService: ProjectsService
    ) {}

    // --- Basic REST APIs ---

    async getModals({
        sortBy = Object.values(ModalFields)[0],
        reverse = false,
        page = 1,
        conditions,
    }: GetAllProps<ModalFields>): Promise<CustomResponseType<Modal[]>> {
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

            const response = await this.modalRepository.find(findQuery.data);

            return foundRes(
                response.length
                    ? "Modals have been found"
                    : "Modals list is empty",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async getModalById(id: string): Promise<CustomResponseType<Modal>> {
        try {
            const response = await this.modalRepository.findOneBy({ id });

            if (!response) return notFoundRes("Modal does not exist");

            return foundRes("Modal has been found", response);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async createModal(
        createModalDto: CreateModalDto
    ): Promise<CustomResponseType<Modal>> {
        try {
            // filter any nulls
            const filteredData =
                filterNullsObject<CreateModalDto>(createModalDto);
            // validate the provided fields
            await validateNewInstance({
                dto: CreateModalDto,
                data: filteredData,
            });
            // deconstruction
            const {
                // --- DUMMY_TABLE_NAME_CREATE ---
                project: projectId,
                ...rest
            } = filteredData;

            const modalObj = { ...rest };

            // --- Table ID check - create ---
            if (projectId) {
                const project =
                    await this.projectsService.getProjectById(projectId);
                if (project.status !== 200) {
                    return notFoundRes("Project doesn't exist");
                }
                modalObj["project"] = project.data;
            }

            // ----------------------

            // create the object and save it in the DB
            const newModal = this.modalRepository.create(modalObj);
            const response = await this.modalRepository.save(newModal);
            // --- Post-response - create ---

            // ----------------------
            // return the response
            return newInstanceRes<Modal>(
                "Modal has been created successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async updateModal(
        id: string,
        updateModalDto: UpdateModalDto
    ): Promise<CustomResponseType<UpdateResult>> {
        try {
            // filter any nulls
            const filteredData =
                filterNullsObject<UpdateModalDto>(updateModalDto);
            // validate the provided fields
            await validateNewInstance({
                dto: UpdateModalDto,
                data: filteredData,
            });
            // check if the id exists
            const modal = await this.getModalById(id);
            if (!modal) {
                return notFoundRes(`Modal does not exist`);
            }
            // deconstruction
            const {
                // --- DUMMY_TABLE_NAME_UPDATE ---
                project: projectId,
                ...rest
            } = filteredData;

            const modalObj = { ...rest };

            // --- Table ID check - update ---
            if (projectId) {
                const project =
                    await this.projectsService.getProjectById(projectId);
                if (project.status !== 200) {
                    return notFoundRes("Project doesn't exist");
                }
                modalObj["project"] = project.data;
            }

            // ----------------------

            // create the object and save it in the DB
            const response = await this.modalRepository.update(
                {
                    id,
                },
                modalObj
            );
            // --- Post-response - update ---

            // ----------------------
            // return the response
            return newInstanceRes<UpdateResult>(
                "Modal has been updated successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async deleteAllModals(): Promise<CustomResponseType<DeleteResult>> {
        try {
            const response = await this.modalRepository.query(
                `TRUNCATE TABLE "modal" CASCADE;`
            );

            return deletedRes("Modals data are wiped out", response);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async deleteModal(id: string): Promise<CustomResponseType<DeleteResult>> {
        try {
            const response = await this.modalRepository.delete(id);

            if (!response) {
                return notFoundRes("Modal does not exist");
            }

            return deletedRes("Modal has been deleted successfully", response);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    // --- Relational REST APIs ---
    async getModalsByProjectId({
        id,
        sortBy = Object.values(ModalFields)[0],
        reverse = false,
        page = 1,
    }: GetAllProps<ModalFields> & { id: string }): Promise<
        CustomResponseType<Modal[]>
    > {
        try {
            const findQuery = filteredGetQuery({
                whereQuery: { project: { id } },
                sortBy,
                reverse,
                page,
            });
            if (findQuery.status !== 200) return notFoundRes(findQuery.message);

            const response = await this.modalRepository.find(findQuery.data);

            return foundRes(
                response.length
                    ? "Modals have been found"
                    : "Modals list is empty",
                response
            );
        } catch (error) {
            return errorRes(error);
        }
    }
}
