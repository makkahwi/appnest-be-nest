import { ProjectsModule } from "../projects/projects.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ModalsService } from "./modals.service";
import { ModalsController } from "./modals.controller";
import { Modal } from "../../entities/modal.entity";

@Module({
    imports: [ProjectsModule, TypeOrmModule.forFeature([Modal])],
    controllers: [ModalsController],
    providers: [ModalsService],
    exports: [ModalsService],
})
export class ModalsModule {}
