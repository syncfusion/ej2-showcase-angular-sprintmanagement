import { Component, ViewChild } from '@angular/core';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { DataService } from 'src/app/data.service';
@Component({
    selector: 'dropdown-list',
    templateUrl: './dropdown-list.component.html',
})
export class DropDownAppComponent {
    @ViewChild('datasourceDropDown')
    public topDropDownInstance?: DropDownListComponent;
    public sportsData?: Object[]
    public fields?: { text: string, value: string } = { text: '', value: '' };
    public height?: string
    public waterMark?: string
    public value?: string
    constructor(private globalVar: DataService) {
    }
    public ngOnInit(): void {
        this.sportsData = [
            { Id: 'Project1', Game: 'Project 1' },
            { Id: 'Project2', Game: 'Project 2' },
            { Id: 'Project3', Game: 'Project 3' },
        ];
        this.fields = { text: 'Game', value: 'Id' }
        this.height = '220px';
        this.waterMark = 'Select a Project';
        this.value = 'Project1';
    }
    public onChange(args: any): void {
        if (this.fields) {
            const selectedProject = args.itemData[this.fields.value]?.toString();
            switch (selectedProject) {
                case 'Project1':
                    this.filterAndUpdateData(this.globalVar.sprintData1);
                    this.globalVar.getInstance().scheduleObj.selectedDate = new Date(this.globalVar.sprintData1[0].StartTime);
                    break;

                case 'Project2':
                    this.filterAndUpdateData(this.globalVar.sprintData2);
                    this.globalVar.getInstance().scheduleObj.selectedDate = new Date(this.globalVar.sprintData2[0].StartTime);
                    break;

                case 'Project3':
                    this.filterAndUpdateData(this.globalVar.sprintData3);
                    this.globalVar.getInstance().scheduleObj.selectedDate = new Date(this.globalVar.sprintData3[0].StartTime);
                    break;
            }
        }
    }
    filterAndUpdateData(projectData: any) {
        let filteredValue: any = projectData;
        if (this.globalVar.resourceSelectValue) {
            filteredValue = filteredValue.filter((obj: { resources: any }) => {
                return this.globalVar.resourceSelectValue == obj.resources
            });
        }
        if (this.globalVar.getInstance().dateRangeInstance.value !== null) {
            const givenStartDate = this.globalVar.getInstance().dateRangeInstance.startDate;
            const givenEndDate = this.globalVar.getInstance().dateRangeInstance.endDate;
            filteredValue = filteredValue.filter((obj: { StartTime: string | number | Date; EndTime: string | number | Date; }) => {
                const startDate = new Date(obj.StartTime);
                const endDate = new Date(obj.EndTime);
                const givenStartDateObj = new Date(givenStartDate);
                const givenEndDateObj = new Date(givenEndDate);

                return startDate >= givenStartDateObj && endDate <= givenEndDateObj;
            });
        }
        this.globalVar.updateCommonDataAndRefreshComponents(filteredValue);
    };
}