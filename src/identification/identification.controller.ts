import { Controller, Post, Body } from '@nestjs/common';
import { IdentificationPayload, IdentificationResponse } from './identification.dtos';
import { IdentificationService } from './identification.service';
import { Contact } from './identification.entity';

@Controller()
export class IdentificationController {
	constructor(private readonly identificationService: IdentificationService) { }


	@Post('identify')
	async identifyUser(@Body() identifyData: IdentificationPayload): Promise<IdentificationResponse> {
		const { email, phoneNumber } = identifyData;

		let allEmails: Set<string> = new Set()
		let allPhoneNumbers: Set<string> = new Set()
		let secondaryContactIds: Set<number> = new Set()
		let primaryContactId: number = null;


		// find all contact by email or phone number
		let allContacts = await this.identificationService.findByEmailOrPhoneNumber(email, phoneNumber)

		
		allContacts.forEach(contact => {
			allEmails.add(contact.email);
			allPhoneNumbers.add(contact.phoneNumber);
			if (contact.linkPrecedence == 'secondary') {
				secondaryContactIds.add(contact.id);
			}
			else{
				primaryContactId = contact.id;
			}
		})

		let response: IdentificationResponse = {
			contact: {
				primaryContatctId: primaryContactId,
				emails: [...allEmails],
				phoneNumbers: [...allPhoneNumbers],
				secondaryContactIds: [...secondaryContactIds]
			}
		}

		return response
	}
}