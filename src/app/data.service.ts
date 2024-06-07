import { Injectable } from '@angular/core';
import { sprintData1, sprintData2, sprintData3 } from '../assets/dataSource';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public resourceSelectValue:any;
  public storeStatusValue:any;
  public isStatusChange:any;
  public isDataChanged:any;
  public storeNewRecord : any;
  public storeScheduleEditID:any;
  public sprintData1:any = sprintData1
  public sprintData2:any = sprintData2
  public sprintData3:any = sprintData3
  public commonData:any = sprintData1
  constructor() { }
  updateCommonDataAndRefreshComponents(commonData: any) {
    this.commonData = commonData;
    const instance = this.getInstance();
    if (instance.kanbanObj) {
      instance.kanbanObj.dataSource = commonData;
    }
    if (instance.scheduleObj) {
      const { scheduleObj } = instance;
      scheduleObj.eventSettings.dataSource = commonData;
      scheduleObj.resources[1].dataSource = commonData;
    }
    if (instance.gantt) {
      instance.gantt.dataSource = commonData;
    }
    if (instance.gridObj) {
      instance.gridObj.dataSource = commonData;
    }
    setTimeout(() => {
      this.updateCardValue(commonData);
    }, 300);
  }
  updateCardValue(passedData?:any): void {
    const projectValue = this.getInstance().topDropDownInstance.value;
    const dateRangeValue = this.getInstance().dateRangeInstance.value;
    const index = parseInt((projectValue as string).slice(-1), 10);
    const currentData = passedData ? passedData : (this as any)[`sprintData${index}`];
    // Define type for counts
    type Counts = { InProgress: number; Testing: number; Open: number; Done: number };
    const counts: Counts = {
      InProgress: 0,
      Testing: 0,
      Open: 0,
      Done: 0,
    };
    currentData.forEach((item: { Status: keyof Counts }) => {
      counts[item.Status]++;
    });
    this.updateCardElement('.detailcontainertodo', counts.Open,0);
    this.updateCardElement('.detailcontainertodo', counts.InProgress,1);
    this.updateCardElement('.detailcontainertodo', counts.Testing,2);
    this.updateCardElement('.detailcontainertodo', counts.Done,3);
  }
  calculateIdValueAndData = () => {
    const projectValue = this.getInstance().topDropDownInstance.value as string;
    const projectData = this[`sprintData${parseInt(projectValue.charAt(projectValue.length - 1), 10)}` as keyof DataService];
    if (!projectData || projectData.length === 0) {
      return { newId: undefined, data: undefined }; // Return an object with undefined values
    }
    const data = { ...projectData[0] };
    let newId = projectData.length;
    do {
      newId++;
    } while (this.idExistsInArray(newId, projectData));
    return { newId, data }; // Return an object with newId and data properties
  }
  idExistsInArray(id: any, array: any[]) {
    return array.some(obj => obj.Id === id);
  }
  updateSprintData(projectValue:any, instance:any, storeNewRecord:any) {
    switch (projectValue) {
      case 'Project1':
        this.sprintData1.push(storeNewRecord)
        this.commonData = instance.dataSource
        break;
      case 'Project2':
        this.sprintData2.push(storeNewRecord)
        this.commonData = instance.dataSource
        break;
      case 'Project3':
        this.sprintData3.push(storeNewRecord)
        this.commonData = instance.dataSource
        break;
    }
  } 
  updateCardElement(selector: string, count: number,indexNumber:number): void {
    const cardElement = document.querySelectorAll(selector)[indexNumber];
    const countTodoElement = cardElement?.querySelector('.counttodo');
    if (countTodoElement) {
      countTodoElement.innerHTML = count.toString();
    }
  }
  updateDataSourceObject = (dataSource: any, id: any, updateData: any) => {
    const targetObject = dataSource.find((obj: { Id: any; }) => obj.Id === id);
    if (targetObject) {
      // Update the object with the provided data
      for (const key in updateData) {
        targetObject[key] = updateData[key];
      }
    }
  };
  getInstance(): any {
    const instance: any = {};
    const components = [
      { id: "component-renderf", prop: "kanbanObj" },
      { id: "component-render-scheduler", prop: "scheduleObj" },
      { id: "component-render-grid", prop: "gridObj" },
      { id: "component-render-gantt", prop: "gantt" },
      { id: "timerangecompo1", prop: "dateRangeInstance" },
      { id: "datasourceDropDown", prop: "topDropDownInstance" }
    ];
    components.forEach(({ id, prop }) => {
      const element = document.getElementById(id) as any;
      if (element && element.ej2_instances && element.ej2_instances.length > 0) {
        instance[prop] = element.ej2_instances[0];
      }
    });
    return instance;
  }
}
