import BaseController from "./BaseController";
import formatter from "../model/formatter";
import JSONModel from "sap/ui/model/json/JSONModel";
import UI5event from "sap/ui/base/Event"
import Fragment from "sap/ui/core/Fragment";
import AvatarGroupItem from "sap/f/AvatarGroupItem";

interface ISpeaker {
	initials: string;
	name: string;
	tooltip: string;
	jobPosition: string;
	src: string;
	fallbackIcon: string;
	company: string;
	scn: string;
	github: string;
	twitter: string;
}

/**
 * @namespace recap.capadvancedprogrammingmodel.controller
 */

export default class Main extends BaseController {
	private formatter = formatter;
	private speakerPopover: any

	public onInit(): void {
		this.getView().setModel(new JSONModel({
			speakers: [
				{
					initials: "DVV",
					name: "Dries Van Vaerenbergh",
					tooltip: "1",
					jobPosition: "Full stack SAP development consultant",
					src: "https://avatars.githubusercontent.com/u/32237030?v=4",
					fallbackIcon: "sap-icon://person-placeholder",
					company: "Flexso",
					scn: "https://people.sap.com/vvdries",
					github: "https://github.com/vvdries",
					twitter: "@vvdries"
				},
				{
					initials: "WL",
					name: "Wouter Lemaire",
					tooltip: "2",
					jobPosition: "SAP solution architect, developer & consultant ",
					src: "https://avatars.githubusercontent.com/u/5943183?v=4",
					fallbackIcon: "sap-icon://person-placeholder",
					company: "Independent Consultant",
					scn: "https://people.sap.com/wouter.lemaire",
					github: "https://github.com/lemaiwo",
					twitter: "@wouter_lemaire"
				}, {
					initials: "GM",
					name: "Gert Mertens",
					tooltip: "3",
					jobPosition: "Full stack SAP development consultant",
					src: "https://avatars.githubusercontent.com/u/91686405?v=4",
					fallbackIcon: "sap-icon://person-placeholder",
					company: "Flexso",
					scn: "https://people.sap.com/mertensgert",
					github: "https://github.com/gertmertens92",
					twitter: ""
				}
			]
		}))
		this.getView().setModel(new JSONModel(), "speakerData");
	}

	public navigate2ServicesApp() : void {
		this.getRouter().navTo("btpServices");
	}

	public async onSpeakerSelect(event: UI5event): Promise<void> {
		const avatarGroupItem = event.getParameter("eventSource");
		const view = this.getView();
		const speaker = avatarGroupItem.getBindingContext().getObject();

		if (!this.speakerPopover) {
			this.speakerPopover = (await Fragment.load({
				id: view.getId(),
				name: "recap.capadvancedprogrammingmodel.view.fragments.SpeakerPopover",
				controller: this
			}))
			view.addDependent(this.speakerPopover);
		}
		(this.getModel("speakerData") as JSONModel).setData(this.getSpeaker(speaker, avatarGroupItem));
		this.speakerPopover.openBy(avatarGroupItem).addStyleClass("sapFAvatarGroupPopover");
	}

	private getSpeaker(speaker: ISpeaker, avatarGroupItem: AvatarGroupItem): any {
		return {
			src: speaker.src,
			initials: speaker.initials,
			fallbackIcon: speaker.fallbackIcon,
			backgroundColor: avatarGroupItem.getAvatarColor(),
			name: speaker.name,
			jobPosition: speaker.jobPosition,
			company: speaker.company,
			scn: speaker.scn,
			github: speaker.github,
			twitter: speaker.twitter
		};
	}

}
