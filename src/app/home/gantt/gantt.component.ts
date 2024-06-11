import { Component, OnInit, ViewChild} from '@angular/core';
import { GanttAllModule, GanttComponent } from '@syncfusion/ej2-angular-gantt';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { DataService } from 'src/app/data.service';
import { editingResources } from 'src/assets/dataSource';
import { DropDownAppComponent } from '../dropdown-list/dropdown-list.component';
@Component({
    selector: 'gantt',
    templateUrl: 'gantt.component.html',
})
export class GanttAppComponent {
    public elem: any;
    public elem3: any;
    public dropdownlistObj: any;
    public dropdownlistObj3: any;
    @ViewChild('componentRenderGantt')
    public gantt?:GanttComponent
    public data?: object[];
    public taskSettings?: object;
    public labelSettings?: object;
    public projectStartDate?: Date;
    public projectEndDate?: Date;
    public splitterSettings:any;
    public editSettings:any
    public toolbar:any;
    public resourceFields:any
    public resources:any
    public progressValue: any;
    public isProgressResize?:boolean;
    public status: any;
    public validationRules:any;
    constructor(private dropDownApp: DropDownAppComponent,private globalVar:DataService) {
        
    }
    public ngOnInit(): void {
        this.data = this.globalVar.commonData;
        this.taskSettings = {
            id: 'Id',
            name: 'Subject',
            startDate: 'StartTime',
            endDate: 'EndTime',
            duration: 'Duration',
            resourceInfo: 'resources',
            progress: 'Progress',
            dependency: 'Predecessor',
        };
        this.splitterSettings= {
            position: "35%"
        }
        this.validationRules = { required: true, minLength: [this.customFn, 'Progress Cant be less than 100 if the status is in Done'] };
        this.editSettings = {
            allowAdding: true,
            allowEditing: true,
            allowDeleting: true,
            allowTaskbarEditing: true,
            mode: 'Dialog',
        }
        this.toolbar=['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Indent', 'Outdent']
        this.projectStartDate = new Date('03/24/2019');
        this.projectEndDate = new Date('07/06/2019');
        this.labelSettings = {
            leftLabel: 'TaskName',
        };
        this.resourceFields = {
            id: 'resourceId',
            name: 'resourceName',
        }
        this.resources = editingResources
    }
    customFn = (args: { [key: string]: string }) => {
        let value: number = parseInt(args['value'], 10);
        const ganttStatusElement: any = document.getElementById('component-render-ganttStatus');
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
    statusEdit: any = {
        create: () => {
            this.elem = document.createElement('input');
            return this.elem;
        },
        read: () => {
            return this.dropdownlistObj.value;;
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
                value: args.rowData[args.column.field],
                floatLabelType: 'Auto',
            });
            this.dropdownlistObj.appendTo(this.elem);
        }
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
                    { Priority: 'Critical' },
                    { Priority: 'Normal' },
                    { Priority: 'High' },
                ],
                fields: { value: 'Priority' },
                value: args.rowData[args.column.field],
                floatLabelType: 'Auto',
            });
            this.dropdownlistObj3.appendTo(this.elem3);
        }
    };     
    dataBound () {
        this.globalVar.updateCardValue(this.gantt?.dataSource)
    }
    queryTaskbarInfo(args: any) {
        if (args.data.taskData.Status == 'InProgress') {
            args.progressBarBgColor = '#c9a7f4';
            args.taskbarBgColor = 'rgba(222, 204, 251, 0.6)';
            args.taskbarBorderColor = 'rgba(222, 204, 251, 1)';
        } else if (args.data.taskData.Status == 'Open') {
            args.progressBarBgColor = 'rgba(203, 228, 252, 1)';
            args.taskbarBgColor = 'rgba(203, 228, 252, 1)';
            args.taskbarBorderColor = 'rgba(203, 228, 252, 1)';
        } else if (args.data.taskData.Status == 'Done') {
            args.progressBarBgColor = 'rgba(204, 234, 189, 1)';
            args.taskbarBgColor = 'rgba(204, 234, 189, 1)';
            args.taskbarBorderColor = 'rgba(204, 234, 189, 1)';
        } else if (args.data.taskData.Status == 'Testing') {
            args.progressBarBgColor = 'rgba(254, 234, 192, 1)';
            args.taskbarBgColor = 'rgba(254, 234, 192, 0.6)';
            args.taskbarBorderColor = 'rgba(254, 234, 192, 1)';
        }
    }
    actionBegin(args: any) {
        if (args.requestType === "beforeAdd" && args.data.ganttProperties.resourceInfo.length === 0) {
            args.cancel = true
            alert("Select Resource to Continue")
        }
        if (args.type == 'edit' || args.requestType == 'beforeOpenEditDialog') {
            this.progressValue = args.rowData.Progress;
            this.status = args.rowData.Status;
        } else if (args.taskBarEditAction == 'ProgressResizing') {
            this.progressValue = args.data.Progress;
            this.isProgressResize = true
        }
        if (args.requestType == 'beforeSave' || args.requestType == 'beforeAdd') {
            if (args.data.Status === 'Open' && parseInt(args.data.Progress) !== 0) {
                args.data.Progress = 0
            }
            if (this.progressValue != args.data.Progress) {
                if (args.data.Progress == 100) {
                    args.data.Status = 'Done';
                    args.data.taskData.Status = 'Done';
                }
            }
            if (args.data.Progress != 0 && args.data.Status == "Open") {
                args.data.Status = 'InProgress';
                args.data.taskData.Status = 'InProgress';
            }
            if (args.data.Progress == 0 && args.data.Status != "Open") {
                args.data.Status = 'Open';
                args.data.taskData.Status = 'Open';
            }
            if (this.status != args.data.Status) {
                if (args.data.Progress < 100 && args.data.Status == "Done" && !this.isProgressResize) {
                    args.data.Progress = 100;
                    args.data.taskData.Progress = 100;
                    args.data.ganttProperties.progress = 100;
                    this.globalVar.updateDataSourceObject(
                        this.gantt?.dataSource,
                        args.data.Id,
                        { Progress: args.data.Progress, Status: args.data.Status }
                    );
                    this.globalVar.commonData = this.gantt?.dataSource;
                }
            }
            if (this.isProgressResize) {
                if (args.data.Progress < 100 && args.data.Status == "Done") {
                    args.data.Status = 'InProgress';
                    args.data.taskData.Status = 'InProgress';
                }
                this.isProgressResize = false;
            }
        }
        if (args.requestType == 'beforeAdd') {
            this.globalVar.storeNewRecord = args.data
            const projectValue = this.globalVar.getInstance().topDropDownInstance.value as string | undefined;
            this.globalVar.updateSprintData(projectValue, this.gantt, this.globalVar.storeNewRecord);
        }
        if (
            args.requestType == 'beforeOpenEditDialog' ||
            args.requestType == 'beforeOpenAddDialog'
        ) {
            const { newId, data } = this.globalVar.calculateIdValueAndData();
            args.rowData.Id = newId
            args.Resources.columns.splice(0, 1);
        }
    }
    actionComplete(args: any) {
        if (
            args.requestType == 'openEditDialog' ||
            args.requestType == 'openAddDialog'
        ) {
            let resources: any = args.data.ganttProperties.resourceInfo;
            let tabObj: any = (document.getElementById(this.gantt?.element.id + '_Tab') as any)['ej2_instances'][0];
            tabObj.selected = (args: any) => {
                if (args.selectedIndex == 2) {
                    let gridObj: any = (document.getElementById(this.gantt?.element.id + 'ResourcesTabContainer_gridcontrol') as any)['ej2_instances'][0];
                    gridObj.selectionSettings = {
                        checkboxOnly: false,
                        type: 'Single',
                        persistSelection: false,
                    };
                    let currentViewData: any = gridObj.getCurrentViewRecords();
                    let indexs: any = [];
                    if (resources && resources.length > 0) {
                        currentViewData.forEach(function (data: any, index: any) {
                            for (let i = 0; i < resources.length; i++) {
                                if (
                                    data.taskData['resourceId'] ===
                                    resources[i]['resourceId'] &&
                                    gridObj.selectionModule &&
                                    gridObj.getSelectedRowIndexes().indexOf(index) === -1
                                ) {
                                    indexs.push(index);
                                }
                            }
                            gridObj.selectRows(indexs);
                        });
                    }
                }
            };
        }
        if (["save", "add", "delete"].includes(args.requestType)) {
            if (args.requestType === "delete" && this.gantt) {
                const dataSourceArray = this.gantt.dataSource as any[];
                const storeArgs = args;
                const newArray = dataSourceArray.filter(item => item.Id !== storeArgs.data[0].Id);
                this.gantt.dataSource = newArray;
                this.globalVar.commonData = newArray;
            }

            const { commonData } = this.globalVar;
            const { gridObj, scheduleObj, kanbanObj } = this.globalVar.getInstance();

            if (gridObj && scheduleObj && kanbanObj) {
                gridObj.dataSource = commonData;
                scheduleObj.eventSettings.dataSource = commonData;
                scheduleObj.resources[1].dataSource = commonData;
                kanbanObj.dataSource = commonData;
            }

            this.globalVar.updateCardValue(this.gantt?.dataSource);
        }
    }
}
