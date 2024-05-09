import { ModalsModule } from "../modals/modals.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PropertiesService } from "./properties.service";
import { PropertiesController } from "./properties.controller";
import { Property } from "../../entities/property.entity";

@Module({
    imports: [ModalsModule, TypeOrmModule.forFeature([Property])],
    controllers: [PropertiesController],
    providers: [PropertiesService],
    exports: [PropertiesService],
})
export class PropertiesModule {}
