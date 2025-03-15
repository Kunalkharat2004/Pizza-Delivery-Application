import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./Tenant";
import { Roles } from "../constants";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  address: string;

  @Column({
    type: "enum",
    enum: Roles,
    default: Roles.CUSTOMER,
  })
  role: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;
}
