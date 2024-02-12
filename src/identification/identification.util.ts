import { Contact } from "./identification.entity";

export class IdentificationUtil {
    static getContactPrimaryId(key: string, value: string, contacts: Contact[]){
        let primaryId: number;
        let filteredContacts = contacts.filter(contact => contact[key] == value);
        if(filteredContacts.length){
            if(filteredContacts[0].linkPrecedence == 'primary'){
                primaryId = filteredContacts[0].id;
            }else{
                primaryId = filteredContacts[0].linkedId;
            }
        }
        return primaryId;
    }
}