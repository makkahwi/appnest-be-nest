import { Property } from "./property.entity";
import { Project } from "./project.entity";
import { Length } from "class-validator";
import {
    Entity,
    OneToMany,
    ManyToOne,
    Column,
    PrimaryGeneratedColumn,
} from "typeorm";
import { IsUUID } from "class-validator";

@Entity()
export class Modal {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    // --- columns ---
    @Length(3, 25)
    @Column({
        nullable: false,
    })
    title: string;

    // --- relations ---
    @OneToMany(() => Property, (property) => property.modal)
    properties: Property[];

    @ManyToOne(() => Project, (project) => project.modals)
    project: Project;
}
