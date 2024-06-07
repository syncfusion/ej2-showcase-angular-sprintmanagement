import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { extend } from '@syncfusion/ej2-base';
import { TimelineViewsService, AgendaService, GroupModel, EventSettingsModel, ResizeService, DragAndDropService, ScheduleModule, ScheduleComponent } from '@syncfusion/ej2-angular-schedule';
import { DropDownAppComponent } from '../dropdown-list/dropdown-list.component';
import { DataService } from 'src/app/data.service';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { editingResources } from 'src/assets/dataSource';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'schedule',
  templateUrl: 'schedule.component.html',
})


export class ScheduleAppComponent {
  @ViewChild('componentRenderScheduler')
  public scheduleObj?: ScheduleComponent;
  public storeScheduleEditID: any
  public progressValue: any
  public status: any
  public selectedDate?: Date
  public editingResources: any
  public commonData: any
  public group?: GroupModel
  constructor(private dropDownApp: DropDownAppComponent, private globalVar: DataService) {

  }
  public ngOnInit(): void {
    this.selectedDate = new Date(2021, 0, 1);
    this.editingResources = editingResources;
    this.commonData = this.globalVar.commonData;
    this.group = {
      resources: ['Projects', 'Categories'],
    };
  }
  public eventSettings: EventSettingsModel = { dataSource: this.globalVar.commonData }
  popupOpen(args: any) {
    if (args.type === 'Editor') {
      this.storeScheduleEditID = args.data.Id
      this.progressValue = args.data.Progress;
      this.status = args.data.Status
      // Create required custom elements in initial time
      let formElement = args.element.querySelector('.e-schedule-form');
      if (formElement && !formElement.querySelector('.custom-field-row')) {
        let row = document.createElement('div');
        row.className = 'custom-field-row';

        // Create a label for the input element
        let label = document.createElement('label');
        label.textContent = 'Status';

        // Remove font-weight styles from the label
        label.style.fontWeight = 'normal'; // Or 'unset'

        let container = document.createElement('div');
        container.className = 'custom-field-container';

        let inputEle = document.createElement('input');
        inputEle.className = 'e-field';
        inputEle.name = 'Status';

        container.appendChild(inputEle);
        row.appendChild(label); // Append the label
        row.appendChild(container);
        let errorMessage = document.createElement('span');
        errorMessage.className = 'error-message';
        errorMessage.style.color = 'red';
        errorMessage.style.display = 'none'; 
        errorMessage.textContent = 'Only Done can be selected if the progress is 100';
        row.appendChild(errorMessage);
        formElement.insertBefore(row, formElement.firstChild);
        const buttonElement = document.querySelector('.e-schedule-dialog.e-control.e-btn.e-lib.e-primary.e-event-save.e-flat') as HTMLButtonElement;
        let dropDownList = new DropDownList({
          dataSource: [
            { text: 'Open', value: 'Open' },
            { text: 'Testing', value: 'Testing' },
            { text: 'InProgress', value: 'InProgress' },
            { text: 'Done', value: 'Done' },
          ],
          fields: { text: 'text', value: 'value' },
          change:function(args) {
            let targetElement: any | null = document.getElementsByClassName("e-field")[0];
            if (args.value != 'Done' && parseInt(targetElement.value) === 100) {
              errorMessage.style.display = 'block'; 
              buttonElement.disabled = true;
              return
            } else {
              errorMessage.style.display = 'none';
              buttonElement.disabled = false; 
            }
            if (targetElement && targetElement.name == 'Progress') {
              const event = new Event('focusout', { bubbles: true });
              targetElement.dispatchEvent(event);
            }
          },
          value: args.data.Status,
        });

        dropDownList.appendTo(inputEle);
      }
      if (formElement && !formElement.querySelector('.custom-field-row-priority')) {
        let row = document.createElement('div');
        row.className = 'custom-field-row-priority';

        // Create a label for the input element
        let label = document.createElement('label');
        label.textContent = 'Priority';

        // Remove font-weight styles from the label
        label.style.fontWeight = 'normal'; // Or 'unset'

        let container = document.createElement('div');
        container.className = 'custom-field-priority';

        let inputEle = document.createElement('input');
        inputEle.className = 'e-field';
        inputEle.name = 'Priority';

        container.appendChild(inputEle);
        row.appendChild(label); // Append the label
        row.appendChild(container);

        formElement.insertBefore(row, formElement.firstChild);

        let dropDownList = new DropDownList({
          dataSource: [
            { text: 'Low', value: 'Low' },
            { text: 'Normal', value: 'Normal' },
            { text: 'Critical', value: 'Critical' },
            { text: 'High', value: 'High' },
          ],
          fields: { text: 'text', value: 'value' },
          value: args.data.Priority,
        });

        dropDownList.appendTo(inputEle);
      }
      if (
        formElement &&
        !formElement.querySelector('.custom-field-row-progress')
      ) {
        let row = document.createElement('div');
        row.className = 'custom-field-row-progress';
        row.style.paddingBottom = '10px';

        // Create a label for the header text
        let headerLabel = document.createElement('label');
        headerLabel.textContent = 'Progress';

        // Remove font-weight styles from the label
        headerLabel.style.fontWeight = 'normal'; // Or 'unset'

        let container = document.createElement('div');
        container.className = 'custom-field-progress';

        let inputEle = document.createElement('input');
        inputEle.className = 'e-field';
        inputEle.name = 'Progress';

        // Set the type to "number" to create a numeric input
        inputEle.type = 'number';
        inputEle.style.width = '100%';
        inputEle.max = "100";
        inputEle.min = "0";
        let errorMessage = document.createElement('span');
        errorMessage.className = 'error-message';
        errorMessage.style.color = 'red';
        errorMessage.style.display = 'none'; // Initially hide the error message
        inputEle.addEventListener('focusout', function (event) {
          const schedulerStatusElement: any = document.getElementsByClassName('custom-field-row')[0].querySelector('input')
          const buttonElement = document.querySelector('.e-schedule-dialog.e-control.e-btn.e-lib.e-primary.e-event-save.e-flat') as HTMLButtonElement;
          let enteredValue = parseInt(inputEle.value, 10);
          if (enteredValue < 0) {
            inputEle.value = '0'; // Set value as string '0'
          }
          if (enteredValue > 100) {
            inputEle.value = '100';
          }
          if (schedulerStatusElement.ej2_instances[0].value == "Done" && enteredValue < 100) {
            errorMessage.textContent = 'Progress Cant be less than 100 if the status is in Done';
            errorMessage.style.display = 'block';
            (event.currentTarget as HTMLElement).style.borderColor = 'red';
            buttonElement.disabled = true;
          } else {
            errorMessage.style.display = 'none';
            (event.currentTarget as HTMLElement).style.borderColor = '';
            buttonElement.disabled = false;
          }
        });
        inputEle.value = args.data.Progress;
        container.appendChild(inputEle);
        row.appendChild(headerLabel);
        row.appendChild(container);
        row.appendChild(errorMessage);
        formElement.insertBefore(row, formElement.firstChild);
      }
    }
  }
  eventRendered(args: any) {
    this.applyCategoryColor(args, this.scheduleObj?.currentView);
  }
  applyCategoryColor = (args: any, currentView: any) => {
    if (!args.element) {
      return;
    }
    if (args.data.Status == 'Done') {
      args.element.style.backgroundColor = 'rgba(204, 234, 189, 1)';
      args.element.style.color = 'rgba(38, 38, 38, 1)'
    } else if (args.data.Status == 'Open') {
      args.element.style.backgroundColor = 'rgba(203, 228, 252, 1)';
      args.element.style.color = 'rgba(38, 38, 38, 1)'
    } else if (args.data.Status == 'InProgress') {
      args.element.style.backgroundColor = 'rgba(222, 204, 251, 1)';
      args.element.style.color = 'rgba(38, 38, 38, 1)'
    } else if (args.data.Status == 'Testing') {
      args.element.style.backgroundColor = 'rgba(254, 234, 192, 1)';
      args.element.style.color = 'rgba(38, 38, 38, 1)'
    }
  };
  actionBegin(args: any) {
    if (args.requestType == 'eventCreate') {

      if (args.data[0].resources) {
        const foundObject: any = editingResources.find(obj => obj.resourceName === args.data[0].resources);
        args.data[0].resources = foundObject.resourceName
      }
    }
    if (args.requestType == 'eventChange') {
      if (args.data.resources) {
        const foundObject: any = editingResources.find(obj => obj.resourceName === args.data.resources);
        args.data.resources = foundObject.resourceName
      }
      if (this.progressValue != parseInt(args.data.Progress)) {
        if (args.data.Progress == 100) {
          args.data.Status = 'Done';
        }
      }
      if (this.status != args.data.Status) {
        if (args.data.Progress < 100 && args.data.Status == "Done") {
          args.data.Progress = 100
        }
      }
      if (args.data.Progress != 0 && args.data.Status == "Open") {
        args.data.Status = 'InProgress';
      }
      if (args.data.Progress == 0 && args.data.Status != "Open") {
        args.data.Status = 'Open';
      }
      if (Array.isArray(this.globalVar.getInstance().scheduleObj.eventSettings.dataSource)) {
        const dataSource = this.globalVar.getInstance().scheduleObj.eventSettings.dataSource;
        const idToMatch = this.storeScheduleEditID;
        dataSource.forEach((item: { Id: any; }) => {
          if (item.Id === idToMatch) {
            item = args.data;
            item.Id = idToMatch;
            return
          }
        });
      }
    }
  }
  actionComplete(args: any) {
    if (args.requestType != 'toolBarItemRendered') {
      setTimeout(() => {
        this.globalVar.getInstance().scheduleObj.refresh();
      }, 0);
    }
  }
  dataBound(args: any) {
    this.globalVar.updateCardValue(this.globalVar.getInstance().scheduleObj.eventSettings.dataSource)
  }
}
