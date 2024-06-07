import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { KanbanComponent, ColumnsModel, CardSettingsModel, SwimlaneSettingsModel, DialogSettingsModel, CardRenderedEventArgs, KanbanModule } from '@syncfusion/ej2-angular-kanban';
import { DatePicker, DateRangePicker, DateTimePicker } from '@syncfusion/ej2-calendars';
import { DropDownList, DropDownTree } from '@syncfusion/ej2-dropdowns';
import { DropDownAppComponent } from '../dropdown-list/dropdown-list.component';
import { addClass } from '@syncfusion/ej2-base';
import { editingResources } from 'src/assets/dataSource';
import { DataService } from 'src/app/data.service';

@Component({
    selector: 'kanban',
    templateUrl: 'kanban.component.html',
})
export class KanbanAppComponent {
    public progressValue: any
    public status: any;
    @ViewChild('componentRenderf')
    public kanbanObj?: KanbanComponent;
    public dataSource?: Object[]
    public swimlaneSettings?: SwimlaneSettingsModel;
    public cardSettings?: CardSettingsModel;
    public dialogSettings?: DialogSettingsModel;
    public columns?: ColumnsModel[];
    constructor(private dropDownApp: DropDownAppComponent, private globalVar: DataService) {

    }
    public ngOnInit(): void {
        this.dataSource = this.globalVar.commonData;
        this.swimlaneSettings = { keyField: 'resources' };
        this.cardSettings = {
            headerField: 'Id',
           template: '#cardTemplate',
        };
        this.dialogSettings = {
            fields: [
                { key: 'Id', text: 'ID', type: 'TextBox' },
                { key: 'Subject', text: 'Subject', type: 'TextArea' },
                { key: 'Status', text: 'Status', type: 'DropDown', validationRules: { required: true, minLength: [this.kanbanStatuscustomFn, 'Only Done can be selected if the progress is 100'] } },
                { key: 'Progress', text: 'Progress', type: 'Numeric', validationRules: { required: true, minLength: [this.customFn, 'Progress Cant be less than 100 if the status is in Done'] } },
                { key: 'StartTime', text: 'Start Time' },
                { key: 'EndTime', text: 'End Time' },
                { key: 'resources', text: 'Resources', validationRules: { required: true } },
                { key: 'Priority', text: 'Priority' }
            ]
        };
        this.columns = [
            { headerText: 'To Do', keyField: 'Open' },
            { headerText: 'In Progress', keyField: 'InProgress' },
            { headerText: 'Testing', keyField: 'Testing' },
            { headerText: 'Done', keyField: 'Done' }
        ];
    }
    getBackgroundColor(tag: string): string {
        let backgroundColor: string;
        switch (tag.trim()) {
            case 'Bug':
                backgroundColor = 'rgba(255, 157, 157, 1)';
                break;
            case 'Customer Task':
                backgroundColor = 'rgba(213, 235, 249, 1)';
                break;
            case 'Internal Request':
                backgroundColor = 'rgba(229, 231, 235, 1)';
                break;
            case 'Release Bug':
                backgroundColor = 'rgba(251, 236, 211, 1)';
                break;
            case 'Breaking Issue':
                backgroundColor = 'rgba(253, 222, 221, 1)';
                break;
            default:
                backgroundColor = '#ffffff';
                break;
        }
        return backgroundColor;
    }  
    getColor(tag: string): string {
        let color: string;
        switch (tag.trim()) {
            case 'Bug':
                color = 'rgba(130, 38, 38, 1)';
                break;
            case 'Customer Task':
                color = 'rgba(0, 95, 156, 1)';
                break;
            case 'Internal Request':
                color = 'rgba(81, 81, 81, 1)';
                break;
            case 'Release Bug':
                color = 'rgba(139, 87, 0, 1)';
                break;
            case 'Breaking Issue':
                color = 'rgba(170, 8, 8, 1)';
                break;
            default:
                color = '#ffffff';
                break;
        }
        return color;
    }  
    customFn: (args: { [key: string]: string }) => any = (args: { [key: string]: string }) => {
        let value: number = parseInt(args['value'])
        const kanbanStatusElement: any = document.getElementsByClassName('Status_wrapper')[0].querySelector('input')
        if (kanbanStatusElement.ej2_instances[0]) {
            if (kanbanStatusElement.ej2_instances[0].value == 'Done' && value < 100) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    kanbanStatuscustomFn = (args: { [key: string]: string }): boolean | undefined => {
        let value: any = args['value'];
        const progressElement: any = document.getElementsByClassName('Progress_wrapper')[0].querySelector('input');
        if (progressElement.ej2_instances[0]) {
          if (progressElement.ej2_instances[0].value === 100 && (value === "InProgress" || value === "Testing" || value ==="Open")) {
            return false;
          } else {
            return true;
          }
        }
        return undefined;
    };
    onDialogClose(args: any) {
        if (args.requestType === 'Edit' && args.name === 'dialogClose') {
            const newProgress = parseInt(args.data.Progress);
            if (args.data.Status === 'Open' && newProgress !== 0) {
                args.data.Progress = 0
            }
            if ((args.data.Status === 'Testing' || args.data.Status === 'InProgress') && (newProgress === 0 || newProgress === 100)) {
                args.data.Progress = 20
            }
            if (newProgress !== this.progressValue) {
                if (newProgress === 100) {
                    args.data.Status = 'Done';
                }
            }
            if (args.data.Progress != 0 && args.data.Status == "Open") {
                args.data.Status = 'InProgress';
            }
            if (args.data.Progress == 0 && args.data.Status != "Open") {
                args.data.Status = 'Open';
            }
            if (args.data.Status != this.globalVar.storeStatusValue) {
                this.globalVar.isStatusChange = true;
            }
            if (this.status !== newProgress && newProgress < 100 && args.data.Status === 'Done') {
                args.data.Progress = 100;
            }
            const targetId = args.data.resources;
            const matchingResource = editingResources.find(resource => resource.resourceId === targetId);
            if (matchingResource) {
                args.data.resources = matchingResource.resourceName;
            }
            this.globalVar.isDataChanged = true;
        }
        if (args.requestType === 'Add') {
            const targetId = args.data.resources;
            const matchingResource = editingResources.find(resource => resource.resourceId === targetId);
            if (matchingResource) {
                args.data.resources = matchingResource.resourceName;
            }
            this.globalVar.storeNewRecord = args.data
        }
    }
    onDialogOpen(args: any) {
        const numericTextboxElement = document.getElementsByClassName("e-numerictextbox")[3] as HTMLElement;
        if (numericTextboxElement) {
            const ej2Instances = (numericTextboxElement as any).ej2_instances;
            ej2Instances[0].max = 100;
            ej2Instances[0].min = 0;
        }
        const fields = args.element.querySelectorAll('.e-field');
        const isCorrectFields = (
            fields[4]?.getAttribute('name') === 'StartTime' &&
            fields[5]?.getAttribute('name') === 'EndTime' &&
            fields[6]?.getAttribute('name') === 'resources' &&
            fields[7]?.getAttribute('name') === 'Priority'
        );
        if (args.data) {
            if (args.data.Status) {
                if (args.requestType === 'Edit') {
                    this.globalVar.storeStatusValue = args.data.Status
                } else if (args.requestType === 'Add') {
                    this.globalVar.isStatusChange = true
                }
            }
        }
        if ((args.requestType === 'Add' || args.requestType === 'Edit') && isCorrectFields) {
            const dateTimeInstance = new DateTimePicker({
                placeholder: "Select a date and time",
                value: args.requestType === 'Edit' ? args.data.StartTime : null
            });
            dateTimeInstance.appendTo(fields[4] as HTMLInputElement);
            const dateTimeInstance1 = new DateTimePicker({
                placeholder: "Select a date and time",
                value: args.requestType === 'Edit' ? args.data.EndTime : null
            });
            dateTimeInstance1.appendTo(fields[5] as HTMLInputElement);
            let resourceObject: any = this.getResourceObject(args.data.resources)
            const dropDownList = new DropDownList({
                dataSource: editingResources,
                fields: { text: 'resourceName', value: 'resourceId' },
                value: args.requestType === 'Edit' ? resourceObject.resourceId : null
            });
            dropDownList.appendTo(fields[6] as HTMLInputElement);
            const dropDownList1 = new DropDownList({
                dataSource: [
                    { name: 'Low', value: 'Low' },
                    { name: 'Critical', value: 'Critical' },
                    { name: 'Normal', value: 'Normal' },
                    { name: 'High', value: 'High' },
                ],
                fields: { text: 'name', value: 'value' },
                value: args.requestType === 'Edit' ? args.data.Priority : null
            });
            dropDownList1.appendTo(fields[7] as HTMLInputElement);
        }
        // Assign progressValue and status for 'Edit'
        if (args.requestType === 'Edit') {
            this.progressValue = args.data.Progress;
            this.status = args.data.Status;
        }
    }
    onActionBegin(args: any) {
        if (args.requestType == 'cardChange') {
            switch (args.changedRecords[0].Status) {
                case "Done":
                  args.changedRecords[0].Progress = 100;
                  break;
                case "Open":
                  args.changedRecords[0].Progress = 0;
                  break;
                default:
                  args.changedRecords[0].Progress = 20;
                  break;
            }
            this.globalVar.isDataChanged = true;
            if (this.globalVar.storeStatusValue != args.changedRecords[0].Status) {
                this.globalVar.isStatusChange = true;
            }
        }
    }
    onActionComplete(args: any) {

    }
    onDataBound(args: any) {
        if (args) {
            if (this.globalVar.isDataChanged) {
                const updatedData = this.kanbanObj?.dataSource;
                if (updatedData) {
                    this.globalVar.commonData = updatedData as any[];
                }
                this.globalVar.isDataChanged = false;
                if (this.globalVar.isStatusChange) {
                    this.globalVar.updateCardValue(this.kanbanObj?.dataSource)
                    this.globalVar.isStatusChange = false
                }
            }
            if (args.requestType == "cardCreated") {
                if (this.globalVar.isStatusChange) {
                    this.globalVar.updateCardValue(this.kanbanObj?.dataSource)
                    const projectValue = this.globalVar.getInstance().topDropDownInstance?.value;
                    this.globalVar.updateSprintData(projectValue, this.kanbanObj,  this.globalVar.storeNewRecord);
                    this.globalVar.isStatusChange = false
                }
            }
        }
    }
    onCardRendered(args: CardRenderedEventArgs): void {
        const priority = args.data?.['Priority']; // Accessing 'Priority' using bracket notation
        if (priority) {
            let val: string = (args.data as { [key: string]: Object })['Priority'] as string; // Accessing 'Priority' using bracket notation
            addClass([args.element], val);
        }
    }
    getResourceObject(resourceStr: any) {
        return editingResources.find(resource => resource.resourceName === resourceStr);
    }
    public getResourceName(data: any): string {
        if (data.resources) {
            return '<div class="e-card-header-title e-tooltip-text">' + data.resources + '</div>';
        } else {
            return '';
        }
    }
    public isStatusOpenOrClose(data: any): boolean {
        return data.Status === 'Open' || data.Status === 'Done';
    }
    public getKanbanResorurceImage(data: any): string {
        if (data.resources) {
            return "//ej2.syncfusion.com/demos/src/gantt/images/' + data.resources + '.png"
        } else {
            return '';
        }
    }
}
