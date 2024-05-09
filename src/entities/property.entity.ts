import { Modal } from "./modal.entity";
import { Entity, ManyToOne, Column, PrimaryGeneratedColumn } from "typeorm";
import { IsUUID } from "class-validator";

@Entity()
export class Property {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    // --- columns ---

    @Column({
        nullable: true,
    })
    unique: boolean;

    @Column({
        nullable: true,
    })
    regex: string;

    @Column({
        nullable: true,
    })
    defaultValue: string;

    @Column({
        nullable: true,
    })
    required: boolean;

    @Column({
        nullable: false,
    })
    type: string;

    @Column({
        nullable: false,
    })
    title: string;

    @Column({
        nullable: false,
    })
    uniqueKey: string;

    // --- relations ---
    @ManyToOne(() => Modal, (modal) => modal.properties)
    modal: Modal;
}
