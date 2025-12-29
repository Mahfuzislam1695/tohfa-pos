import { IconType } from "react-icons/lib";

export interface ILink {
  label: string;
  href: string;
  icon?: IconType;
  children?: {
    label: string;
    href: string;
  }[];
}

export interface ILinkProps {
  stackholder: number;
  stakeholderReferenceID?: number;
  routes: ILink[] | ((userRoles: { designationID: number }[]) => ILink[]);
}

export type UserInfoByIdProps = {
  clientUnitID?: string | null;
  clientUnitName?: string | null;
  createdAt?: string;
  designationID?: string;
  designationName?: string;
  email?: string;
  name?: string;
  phone?: string;
  stakeholderID?: string;
  stakeholderName?: string;
  stakeholderReferenceID?: string;
  status?: string;
  updatedAt?: string;
  userID?: string;
  logoUrl?: string;
};

export interface QuotationStatistics {
  itemID: string;
  itemName: string;
  totalResponses: number;
  requisitionID: string;
  clientName: string;
  clientUnitName: string;
  status: string;
}
