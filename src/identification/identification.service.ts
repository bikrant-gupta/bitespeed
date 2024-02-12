import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './identification.entity';
import { IdentificationUtil } from './identification.util';

@Injectable()
export class IdentificationService {
    constructor(
        @InjectRepository(Contact)
        private readonly identificationRepository: Repository<Contact>,
    ) { }

    async findByIdOrLinkedId(id: number): Promise<Contact[] | undefined> {
        return await this.identificationRepository.find({
            where: [{ linkedId: id }, { id }]
        });
    }

    async createContact(contactData: Partial<Contact>): Promise<Contact> {
        const newContact = this.identificationRepository.create(contactData);
        return await this.identificationRepository.save(newContact);
    }

    async findByEmailOrPhoneNumber(email: string, phoneNumber: string): Promise<Contact[] | undefined> {
        let allContacts = await this.identificationRepository.find({
            where: [{ email }, { phoneNumber }],
        });

        if (!allContacts) {
            // no recoards with email and phone, so create new record
            allContacts = [await this.createContact({email, phoneNumber})]
        }else{
            let emailContactPrimaryId = IdentificationUtil.getContactPrimaryId('email', email, allContacts);
            let phoneContactPrimaryId = IdentificationUtil.getContactPrimaryId('phoneNumber', phoneNumber, allContacts);
            let primaryId: number = null;

            if (!emailContactPrimaryId || !phoneContactPrimaryId) {
                // if email or phone number doesn't exist in DB
                primaryId = emailContactPrimaryId || phoneContactPrimaryId;
                let data = {
                    email,
                    phoneNumber,
                    linkedId: primaryId,
                    linkPrecedence: "secondary"
                };
                // create new as secondary contact
                let newContact = await this.createContact(data);
                allContacts.push(newContact);
            }
            else if (emailContactPrimaryId != phoneContactPrimaryId) {
                // if email and phoneNumber has different primary contact.
                primaryId = await this.mergeContactIds(emailContactPrimaryId, phoneContactPrimaryId);

            } else {
                primaryId = emailContactPrimaryId;
            }

            allContacts = await this.findByIdOrLinkedId(primaryId);
        }
        return allContacts;
    }


    async findByIds(ids: number[]): Promise<Contact[]> {
        return await this.identificationRepository
          .createQueryBuilder('contact')
          .where('contact.id IN (:...ids)', { ids })
          .getMany();
    }
    

    async mergeContactIds(contactId1: number, contactId2: number): Promise<number> {
        let contacts = await this.findByIds([contactId1, contactId2]);

        let oldest_contact = contacts[0].createdAt < contacts[1].createdAt ? contacts[0] : contacts[1];
        let newest_contact = contacts[0].createdAt >= contacts[1].createdAt ? contacts[0] : contacts[1];


        // update 2nd contact and all dependents's linkPrecedence and linkedId
        await this.identificationRepository
            .createQueryBuilder()
            .update(Contact)
            .set({ linkPrecedence: "secondary", linkedId: oldest_contact.id })
            .where("id = :id OR linkedId = :id", { id: newest_contact.id })
            .execute();

        return oldest_contact.id
    }
}

