import { Controller, Post, Body, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { IdentificationPayload, IdentificationResponse } from './identification.dtos';
import { IdentificationService } from './identification.service';

@Controller()
export class IdentificationController {
	constructor(private readonly identificationService: IdentificationService) { }

	@Post('identify')
	async identifyUser(@Body() identifyData: IdentificationPayload): Promise<IdentificationResponse> {
		const { email, phoneNumber } = identifyData;
		if (!email && !phoneNumber) {
			throw new BadRequestException('Email or phone number is required');
		}

		try {

			let allEmails: Set<string> = new Set()
			let allPhoneNumbers: Set<string> = new Set()
			let secondaryContactIds: Set<number> = new Set()
			let primaryContactId: number = null;


			// find all contact by email or phone number
			let allContacts = await this.identificationService.findByEmailOrPhoneNumber(email, phoneNumber)


			allContacts.forEach(contact => {
				if (contact.email) allEmails.add(contact.email);
				if (contact.phoneNumber) allPhoneNumbers.add(contact.phoneNumber);
				if (contact.linkPrecedence == 'secondary') secondaryContactIds.add(contact.id);
				else primaryContactId = contact.id;
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
		catch (e) {
			throw new InternalServerErrorException('An error occurred while processing the request');
		}
	}
}