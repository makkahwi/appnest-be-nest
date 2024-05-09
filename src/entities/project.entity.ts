import { Modal } from "./modal.entity";
import { Length } from "class-validator";
import { Entity, OneToMany, Column, PrimaryGeneratedColumn } from "typeorm";
import { IsUUID } from "class-validator";

@Entity()
export class Project {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    // --- columns ---

    @Column({
        nullable: false,
    })
    description: string;

    @Length(3, 25)
    @Column({
        nullable: false,
    })
    title: string;

    // --- relations ---
    @OneToMany(() => Modal, (modal) => modal.project)
    modals: Modal[];
}
