import { Component, OnInit, ViewChild } from '@angular/core';
import { SortService, GridModule, GridComponent } from '@syncfusion/ej2-angular-grids';
import { DataService } from 'src/app/data.service';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { editingResources } from 'src/assets/dataSource';
import { DropDownAppComponent } from '../dropdown-list/dropdown-list.component';

@Component({
    selector: 'grid',
    templateUrl: 'grid.component.html',
})
export class GridAppComponent {
    @ViewChild('componentRenderGrid')
    public gridObj?:GridComponent;
    public priorityData:any
    public elem: any;
    public dropdownlistObj: any;
    public elem3: any;
    public dropdownlistObj3: any;
    public elem1: any;
    public dropdownlistObj1: any;
    public resourceData:any;
    public editSettings?: Object;
    public data: Object[] = [];
    public statusData:any;
    public validationRules:any;
    public statusValidationRules:any;
    public groupSettings:any 
    public resource: any;
    public resourceObj: any;
    public toolbar:any
    constructor(private dropDownApp: DropDownAppComponent,private globalVar:DataService) {
        
    }
    ngOnInit(): void {
        this.data =this.globalVar.commonData;
        this.statusData = [
            { Status: 'Open' },
            { Status: 'Testing' },
            { Status: 'InProgress' },
            { Status: 'Done' },
        ]
        this.toolbar= ['Add', 'Edit', 'Delete', 'Update', 'Cancel']
        this.validationRules = { required: true, minLength: [this.gridcustomFn, 'Progress Cant be less than 100 if the status is in Done'] };
        this.statusValidationRules = { required: true, minLength: [this.gridStatusCustomFn, 'Only Done can be selected if the progress is 100'] };
        this.priorityData = [
            { Priority: 'Low' },
            { Priority: 'Normal' },
            { Priority: 'Critical' },
            { Priority: 'High' },
        ]
        this.resourceData=editingResources
        this.editSettings = {
            allowEditing: true,
            allowAdding: true,
            allowDeleting: true,
            newRowPosition: 'Top',
            mode: 'Dialog'
        };
        this.groupSettings ={ showDropArea: false, columns: ['resources'] }
    }
    statusEdit: any = {
        create: () => {
            this.elem = document.createElement('input');
            return this.elem;
        },
        read: () => {
            return this.dropdownlistObj.value;
        },
        destroy: () => {
            this.dropdownlistObj.destroy();
        },
        write: (args: any) => {
            this.dropdownlistObj = new DropDownList({
                dataSource: [
                    { Status: 'Open' },
                    { Status: 'Testing' },
                    { Status: 'InProgress' },
                    { Status: 'Done' },
                ],
                fields: { value: 'Status' },
                placeholder: "Status",
                value: args.rowData[args.column.field],
                floatLabelType: 'Auto',
            });
            this.dropdownlistObj.appendTo(this.elem);
        },
    }; 
    priorityEdit: any = {
        create: () => {
            this.elem3 = document.createElement('input');
            return this.elem3;
          },
          read: () => {
            return this.dropdownlistObj3.value;
          },
          destroy: () => {
            this.dropdownlistObj3.destroy();
          },
          write: (args: any) => {
            this.dropdownlistObj3 = new DropDownList({
              dataSource: [
                { Priority: 'Low' },
                { Priority: 'Normal' },
                { Priority: 'Critical' },
                { Priority: 'High' },
              ],
              fields: { value: 'Priority' },
              placeholder:"Priority",
              value: args.rowData[args.column.field],
              floatLabelType: 'Auto',
            });
            this.dropdownlistObj3.appendTo(this.elem3);
        },
    };
    resourceEdit: any = {
        create: () => {
            this.elem1 = document.createElement('input');
            return this.elem1;
        },
        read: () => {
            const selectedValue = this.dropdownlistObj1.value;
            const matchingResource = editingResources.find(
                (resource) => resource.resourceId === selectedValue
            );

            if (matchingResource) {
                return matchingResource.resourceName; // Return the matching object as an array
            }

            return null; // Return null if no matching object is found
        },
        destroy: () => {
            this.dropdownlistObj1.destroy();
        },
        write: (args: any) => {
            let valueToSet = args.rowData && args.rowData[args.column.field] ? args.rowData[args.column.field] : null;
            editingResources.forEach(obj => {
                if (obj.resourceName === valueToSet) {
                    valueToSet = obj.resourceId
                    return
                }
            });
            this.dropdownlistObj1 = new DropDownList({
                dataSource: editingResources,
                fields: { text: 'resourceName', value: 'resourceId' },
                value: valueToSet,
                placeholder: "Resource",
                floatLabelType: 'Auto',
            });
            this.dropdownlistObj1.appendTo(this.elem1);
        },
    }
    gridcustomFn = (args: { [key: string]: string }) => {
        let value: number = parseInt(args['value'], 10); // Parse the value as a number with base 10
        const ganttStatusElement: any = document.getElementById('component-render-gridStatus');
        if (ganttStatusElement) {
            if (ganttStatusElement.ej2_instances[0].value === "Done" && value < 100) {
                return false;
            } else {
                return true;
            }
        } else {
            if (status === "Done" && value < 100) {
                return false;
            } else {
                return true;
            }
        }
    };
    gridStatusCustomFn = (args: { [key: string]: string }) => {
        let value: any = args['value'];
        const progressElement: any = document.getElementById('component-render-gridProgress');
        if (progressElement.ej2_instances[0]) {
            if (progressElement.ej2_instances[0].value === 100 && (value === "InProgress" || value === "Testing" || value === "Open")) {
                return false;
            } else {
                return true;
            }
        }
        return undefined
    }
    actionBegin(args: any): void {
        if (args.requestType === 'beginEdit') {
            if (args.rowData.resources) {
                this.resource = args.rowData.resources;
                this.resourceObj = args.rowData.resources;
            }
        }
        if (args.requestType === 'save') {
            if (args.data.resources) {
                args.data.resources = args.data.resources
            }
            if (!args.data.Id) {
                if (Array.isArray(this.gridObj?.dataSource)) {
                    args.data.Id = (this.gridObj?.dataSource?.length ?? 0) + 1;
                }
            }
            if (!args.data.resources) {
                args.data.resources = this.resourceObj;
            }
            if (args.data.Status === 'Open' && parseInt(args.data.Progress) != 0) {
                args.data.Progress = 0
            }
            if ((args.data.Status === 'InProgress' || args.data.Status === 'Testing') && (parseInt(args.data.Progress) === 0 || parseInt(args.data.Progress) === 100)) {
                args.data.Progress = 20
            }
            if (args.data.Progress === 100) {
                args.data.Status = 'Done';
            }
            if (args.data.Progress < 100 && args.data.Status == "Done") {
                args.data.Progress = 100
            }
            if (args.data.Progress != 0 && args.data.Status == "Open") {
                args.data.Status = 'InProgress';
            }
            if (args.data.Progress == 0 && args.data.Status != "Open") {
                args.data.Status = 'Open';
            }
            this.globalVar.storeNewRecord = args.data
            const projectValue = this.globalVar.getInstance().topDropDownInstance.value as string | undefined;
            if (args.action == 'add') {
                this.globalVar.updateSprintData(projectValue, this.gridObj, this.globalVar.storeNewRecord);
            }
            this.globalVar.updateDataSourceObject(
                this.gridObj?.dataSource,
                args.data.Id,
                args.data
            );
            this.globalVar.commonData = this.gridObj?.dataSource;
            setTimeout(() => {
                this.gridObj?.refresh();
            }, 100);            
        }
    }
    dataBound() {
        this.globalVar.updateCardValue(this.gridObj?.dataSource)
    }
    gridGroupTemplate = (props:any) => {
        return props.items[0].resources
    }
    getgridObj(): GridComponent | undefined {
        return this.gridObj;
    }
    startdateValueAccessor(field: any, valueAccessordata: any): any {
        if (valueAccessordata && valueAccessordata.StartTime) {
            const originalDateString = valueAccessordata.StartTime
            const originalDate = new Date(originalDateString);
            const day = originalDate.getUTCDate();
            const month = originalDate.getUTCMonth() + 1;
            const year = originalDate.getUTCFullYear();
            const formattedDay = day < 10 ? '0' + day : day;
            const formattedMonth = month < 10 ? '0' + month : month;
            const formattedDateString = `${formattedDay}.${formattedMonth}.${year}`;
            return formattedDateString
        }
        return '';
    }
    enddateValueAccessor(field: any, valueAccessordata: any): any {
        if (valueAccessordata && valueAccessordata.EndTime) {
            const originalDateString = valueAccessordata.EndTime
            const originalDate = new Date(originalDateString);
            const day = originalDate.getUTCDate();
            const month = originalDate.getUTCMonth() + 1;
            const year = originalDate.getUTCFullYear();
            const formattedDay = day < 10 ? '0' + day : day;
            const formattedMonth = month < 10 ? '0' + month : month;
            const formattedDateString = `${formattedDay}.${formattedMonth}.${year}`;
            return formattedDateString
        }
        return '';
    }
}