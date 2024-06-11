import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { DateRangePickerComponent } from '@syncfusion/ej2-angular-calendars';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { DataService } from '../data.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  public window:any={}
    public resourceSelectValue:any;
    constructor(private globalVar:DataService,private renderer: Renderer2) { }
  ngOnInit() {
    this.checkWindowWidthOnInit();
  }
  ngAfterViewInit(): void {
    this.bindTabClickEvent();
    this.bindEventListeners();
    this.bindScrollEvent();
    this.adjustElementHeight()
   // this.updateCardValue()
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowWidth();
  }
  adjustElementHeight() {
    const element = document.getElementsByClassName('main-content')[0] as HTMLElement;
    const elementHeight = element.clientHeight -
      parseFloat(getComputedStyle(element).paddingTop) -
      parseFloat(getComputedStyle(element).paddingBottom) -
      parseFloat(getComputedStyle(element).marginTop) -
      parseFloat(getComputedStyle(element).marginBottom);
    const filterHeight = document.getElementsByClassName('datasource-filter-container')[0].getBoundingClientRect().height;
    const titleHeight = document.getElementsByClassName('title-container')[0].getBoundingClientRect().height;
    const changeElement = document.getElementsByClassName('component-contain')[0] as HTMLElement;
    const desiredHeight = elementHeight - (filterHeight + titleHeight);
    changeElement.style.height = (desiredHeight -10)+ 'px';
    const elementGrid = document.getElementById('component-render-grid');
    if (elementGrid) {
      if ((desiredHeight - 87.5) > 549 && (desiredHeight - 87.5) < 1433) {
        elementGrid.style.height = (desiredHeight - 89) + 'px';
      } else if ((desiredHeight - 87.5) > 1433) {
        elementGrid.style.height = (desiredHeight - 94) + 'px';
      } else {
        elementGrid.style.height = (desiredHeight - 87.5) + 'px';
      }
    }
  }
  checkWindowWidthOnInit(): void {
    if (window.innerWidth < 500) {
      this.renderer.removeClass(document.getElementsByClassName('component-contain')[0], 'add-overflow');
    } else {
      this.renderer.addClass(document.getElementsByClassName('component-contain')[0], 'add-overflow');
      this.adjustElementHeight()
    }
    if (window.innerWidth < 380) {
      this.renderer.addClass(document.getElementsByClassName("parent-kanban")[1], "show1-background");
    }
  }
  checkWindowWidth(): void {
    if (window.innerWidth < 500) {
      this.renderer.removeClass(document.getElementsByClassName('component-contain')[0], 'add-overflow');
    } else {
      this.renderer.addClass(document.getElementsByClassName('component-contain')[0], 'add-overflow');
      this.adjustElementHeight()
    }
    if (window.innerWidth >= 700) {
      const centeredDiv: HTMLDivElement | null = document.querySelector('.mobile-nav-bar');
      let storedClassName: any;
      if (centeredDiv) {
        const elements: NodeListOf<HTMLDivElement> = centeredDiv.querySelectorAll('div');
        elements.forEach(function (element: HTMLDivElement, index: number) {
          if (element.classList.contains('show1-background')) {
            storedClassName = element.classList[0];
            element.classList.remove('show1-background');
          }
        });
        if (storedClassName) {
          document.getElementsByClassName(storedClassName)[0].classList.add("show1-background");
        }
      }
    } else {
      const centeredDiv: HTMLDivElement | null = document.querySelector('.centered-div');
      let storedClassName: any;
      if (centeredDiv) {
        const elements: NodeListOf<HTMLDivElement> = centeredDiv.querySelectorAll('div');
        elements.forEach(function (element: HTMLDivElement, index: number) {
          if (element.classList.contains('show1-background')) {
            storedClassName = element.classList[0];
            element.classList.remove('show1-background');
          }
        });
        if (storedClassName) {
          document.getElementsByClassName(storedClassName)[1].classList.add("show1-background");
        }
      }
    }
  }
  imageClick(event: MouseEvent): void {
    const imageContainer: HTMLElement | null = document.getElementById('image-container') as HTMLElement;
    if (imageContainer) {
      const circularImages: NodeListOf<HTMLElement> = imageContainer.querySelectorAll('.circular-image');
      const target = event.target as HTMLImageElement;
      if (target.tagName === 'IMG') {
        let altText: any = target.alt;
        if (altText) {
          if (this.resourceSelectValue == altText) {
            altText = null
          }
          this.resourceSelectValue = altText
          this.resourceFilterImage(altText);
          if (target.classList.contains('selected-image')) {
            target.classList.remove('selected-image');
          } else {
            circularImages.forEach(img => {
              img.classList.remove('selected-image');
            });

            // Add box shadow to the clicked image
            target.classList.add('selected-image');
          }
        }
      }
    }
  }
  resourceFilterImage(value: any): void {
    const projectValue = this.globalVar.getInstance().topDropDownInstance?.value;
    const dateRangeValue = this.globalVar.getInstance().dateRangeInstance?.value;
    const currentData = (this.globalVar as any)[`sprintData${(projectValue as any).slice(-1)}` as keyof any];
    if (value) {
      const filteredData = currentData.filter((item: { resources: any; StartTime: string | number | Date; EndTime: string | number | Date; }) => {
        const resourceMatch =
          typeof value === 'string' && value &&
          item.resources === value;
        const dateMatch =
          !dateRangeValue ||
          (!this.globalVar.getInstance().dateRangeInstance ||
            (new Date(item.StartTime) >= this.globalVar.getInstance().dateRangeInstance.startDate &&
              new Date(item.EndTime) <= this.globalVar.getInstance().dateRangeInstance.endDate));

        return resourceMatch && dateMatch;
      });

      this.updateCommonDataAndRefreshComponents(filteredData);
    } else {
      this.updateCommonDataAndRefreshComponents(currentData);
    }
  }
  updateCommonDataAndRefreshComponents(commonData: any) {
    this.window.commonData = commonData;
    if (this.globalVar.getInstance().kanbanObj) {
      this.globalVar.getInstance().kanbanObj.dataSource = commonData;
    }
    if (this.globalVar.getInstance().scheduleObj) {
      this.globalVar.getInstance().scheduleObj.eventSettings.dataSource = commonData;
      this.globalVar.getInstance().scheduleObj.resources[1].dataSource = commonData
    }
    if (this.globalVar.getInstance().gantt) {
      this.globalVar.getInstance().gantt.dataSource = commonData;
    }
    if (this.globalVar.getInstance().gridObj) {
      this.globalVar.getInstance().gridObj.dataSource = commonData;
    }
    setTimeout(() => {
      this.updateCardValue(commonData);
    }, 300);
  }
  bindTabClickEvent(): void {
    const kanban = document.getElementById("component-renderf") as HTMLElement;
    const scheduler = document.getElementById("component-render-scheduler") as HTMLElement;
    const gantt1 = document.getElementById("component-render-gantt") as HTMLElement;
    const grid = document.getElementById("component-render-grid") as HTMLElement;
    kanban.classList.add("show1")
    const setActiveTab = (activeTab: HTMLElement, backgroundClass: string): void => {
      const elements = [
        document.getElementsByClassName("parent-kanban")[0],
        document.getElementsByClassName("parent-scheduler")[0],
        document.getElementsByClassName("parent-gantt")[0],
        document.getElementsByClassName("parent-grid")[0]
      ];
      elements.forEach(element => {
        if (element) {
          element.classList.remove("show1-background");
        }
      });
      if (activeTab) {
        activeTab.classList.add("show1-background");
      }
      [kanban, scheduler, gantt1, grid].forEach(component => {
        if (component) {
          component.classList.remove("show1");
        }
      });
      if (activeTab === document.getElementsByClassName("parent-kanban")[0]) {
        kanban?.classList.add("show1");
        this.globalVar.getInstance().kanbanObj?.refresh();
      } else if (activeTab === document.getElementsByClassName("parent-scheduler")[0]) {
        scheduler?.classList.add("show1");
        this.globalVar.getInstance().scheduleObj?.refresh();
      } else if (activeTab === document.getElementsByClassName("parent-gantt")[0]) {
        gantt1?.classList.add("show1");
        setTimeout(() => {
          this.globalVar.getInstance().gantt.refresh();
        }, 500);
      } else if (activeTab === document.getElementsByClassName("parent-grid")[0]) {
        grid?.classList.add("show1");
        this.globalVar.getInstance().gridObj?.refresh();
      }
    };
    setActiveTab(document.getElementsByClassName("parent-kanban")[0] as HTMLElement, "show1-background");
    const parentElement = document.getElementsByClassName("centered-div")[0] as HTMLElement;
    parentElement?.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        element.addEventListener("click", (e: any) => {
          if (e.target.classList.contains("navimage-kanban") || e.target.classList.contains("parent-kanban")) {
            setActiveTab(document.getElementsByClassName("parent-kanban")[0] as HTMLElement, "show1-background");
          } else if (e.target.classList.contains("navimage-scheduler") || e.target.classList.contains("parent-scheduler")) {
            setActiveTab(document.getElementsByClassName("parent-scheduler")[0] as HTMLElement, "show1-background");
          } else if (e.target.classList.contains("navimage-gantt") || e.target.classList.contains("parent-gantt")) {
            setActiveTab(document.getElementsByClassName("parent-gantt")[0] as HTMLElement, "show1-background");
          } else if (e.target.classList.contains("navimage-grid") || e.target.classList.contains("parent-grid")) {
            setActiveTab(document.getElementsByClassName("parent-grid")[0] as HTMLElement, "show1-background");
          }
        });
      }
    });
  }
  bindEventListeners(): void {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const clickOrTouchEvent = isTouchDevice ? 'touchstart' : 'click';
    const kanban = document.getElementById("component-renderf") as HTMLElement;
    const scheduler = document.getElementById("component-render-scheduler") as HTMLElement;
    const gantt1 = document.getElementById("component-render-gantt") as HTMLElement;
    const grid = document.getElementById("component-render-grid") as HTMLElement;
    kanban.classList.add("show1");
    const setActiveTab = (activeTab: HTMLElement, backgroundClass: string): void => {
      const elements = [
        document.getElementsByClassName("parent-kanban")[1],
        document.getElementsByClassName("parent-scheduler")[1],
        document.getElementsByClassName("parent-gantt")[1],
        document.getElementsByClassName("parent-grid")[1]
      ];
      elements.forEach(element => {
        if (element) {
          element.classList.remove("show1-background");
        }
      });
      if (activeTab) {
        activeTab.classList.add("show1-background");
      }
      [kanban, scheduler, gantt1, grid].forEach(component => {
        if (component) {
          component.classList.remove("show1");
        }
      });
      if (activeTab === document.getElementsByClassName("parent-kanban")[1]) {
        kanban?.classList.add("show1");
        this.globalVar.getInstance().scheduleObj?.refresh();
        this.globalVar.getInstance().kanbanObj?.refresh();
      } else if (activeTab === document.getElementsByClassName("parent-scheduler")[1]) {
        scheduler?.classList.add("show1");
        this.globalVar.getInstance().kanbanObj?.refresh();
        this.globalVar.getInstance().scheduleObj?.refresh();
      } else if (activeTab === document.getElementsByClassName("parent-gantt")[1]) {
        gantt1?.classList.add("show1");
        this.globalVar.getInstance().scheduleObj?.refresh();
        this.globalVar.getInstance().kanbanObj?.refresh();
        setTimeout(() => {
          this.globalVar.getInstance().gantt?.refresh();
        }, 0);
      } else if (activeTab === document.getElementsByClassName("parent-grid")[1]) {
        grid?.classList.add("show1");
        this.globalVar.getInstance().scheduleObj?.refresh();
        this.globalVar.getInstance().kanbanObj?.refresh();
        this.globalVar.getInstance().gantt?.refresh();
        this.globalVar.getInstance().gridObj?.refresh();
      }
    };
    const parentElement = document.getElementsByClassName("mobile-nav-bar")[0] as HTMLElement;
    parentElement?.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        element.addEventListener(clickOrTouchEvent, (e: any) => {
          if (e.target.classList.contains("navimage-kanban") || e.target.classList.contains("parent-kanban")) {
            setActiveTab(document.getElementsByClassName("parent-kanban")[1] as HTMLElement, "show1-background");
          } else if (e.target.classList.contains("navimage-scheduler") || e.target.classList.contains("parent-scheduler")) {
            setActiveTab(document.getElementsByClassName("parent-scheduler")[1] as HTMLElement, "show1-background");
          } else if (e.target.classList.contains("navimage-gantt") || e.target.classList.contains("parent-gantt")) {
            setActiveTab(document.getElementsByClassName("parent-gantt")[1] as HTMLElement, "show1-background");
          } else if (e.target.classList.contains("navimage-grid") || e.target.classList.contains("parent-grid")) {
            setActiveTab(document.getElementsByClassName("parent-grid")[1] as HTMLElement, "show1-background");
          }
        });
      }
    });
  }
  bindScrollEvent(): void { 
    let createContainer: Element | null = document.querySelector('.create-container');
    if (createContainer !== null) {
      createContainer.addEventListener('scroll', function (event) {
        if (event.currentTarget instanceof HTMLElement) {
          if (event.currentTarget.scrollTop > 110) {
            let datasourceFilter: Element | undefined = document.getElementsByClassName('datasource-filter-container')[0];
            if (datasourceFilter instanceof HTMLElement) {
              datasourceFilter.style.visibility = "hidden";
            }
          } else {
            let datasourceFilter: HTMLElement = document.getElementsByClassName('datasource-filter-container')[0] as HTMLElement;
            if (datasourceFilter instanceof HTMLElement) {
              datasourceFilter.style.visibility = "";
            }
          }
        }
      });
    }
  }
  updateCardValue(passedData?:any): void {
    const projectValue = this.globalVar.getInstance().topDropDownInstance?.value;
    const dateRangeValue = this.globalVar.getInstance().dateRangeInstance?.value;
    const index = parseInt((projectValue as string).slice(-1), 10);
    const currentData = passedData ? passedData : (this.globalVar as any)[`sprintData${index}`];
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
  updateCardElement(selector: string, count: number,indexNumber:number): void {
    const cardElement = document.querySelectorAll(selector)[indexNumber];
    const countTodoElement = cardElement?.querySelector('.counttodo');
    if (countTodoElement) {
      countTodoElement.innerHTML = count.toString();
    }
  }
  handleClick() {
    const projectValue = this.globalVar.getInstance().topDropDownInstance?.value as string;
    const projectData = this.globalVar[`sprintData${parseInt(projectValue.charAt(projectValue.length - 1), 10)}` as keyof DataService];
    if (!projectData || projectData.length === 0) {
      // Handle the case when projectData is not defined or is an empty array
      return;
    }
    const { newId, data } = this.globalVar.calculateIdValueAndData();
    data.Id = newId;
    let indexValue: any;
    const centeredDiv: HTMLDivElement | null = document.querySelector('.centered-div');
    if (centeredDiv) {
      let elements: any = centeredDiv.querySelectorAll('div');
      let parentDiv: any = [];
      elements.forEach(function (element: any) {
        if (element.className.includes("parent")) {
          parentDiv.push(element)
        }
      })
      elements = parentDiv
      elements.forEach(function (element: HTMLDivElement, index: number) {
        if (element.classList.contains('show1-background')) {
          indexValue = index
        }
      });
    }
    switch (indexValue) {
      case 0:
        this.globalVar.getInstance().kanbanObj?.openDialog("Add", data)
        break;
      case 1:
        this.globalVar.getInstance().scheduleObj?.openEditor(data, "Add")
        break;
      case 2:
        this.globalVar.getInstance().gantt?.openAddDialog();
        break;
      case 3:
        if (this.globalVar.getInstance().gridObj) {
          this.globalVar.getInstance().gridObj.editSettings.mode = "Dialog";
        }
        this.globalVar.getInstance().gridObj?.editModule.addRecord();
        break;
    }
  }
  handleClick1() {
    const projectValue = this.globalVar.getInstance().topDropDownInstance?.value as string;
    const projectData = (this.globalVar as any)[`sprintData${+projectValue.charAt(projectValue.length - 1)}`];
    if (!projectData || projectData.length === 0) {
      return;
    }
    const { newId, data } = this.globalVar.calculateIdValueAndData();
    data.Id = newId;
    let indexValue: any;
    const centeredDiv: HTMLDivElement | null = document.querySelector('.mobile-nav-bar');
    if (centeredDiv) {
      let elements: NodeListOf<HTMLDivElement> = centeredDiv.querySelectorAll('div');
      let parentDiv: any = [];
      elements.forEach(function (element: any) {
        if (element.className.includes("parent")) {
          parentDiv.push(element)
        }
      })
      elements = parentDiv
      elements.forEach(function (element: HTMLDivElement, index: number) {
        if (element.classList.contains('show1-background')) {
          indexValue = index
        }
      });
    }
    switch (indexValue) {
      case 0:
        this.globalVar.getInstance().kanbanObj?.openDialog("Add", data)
        break;
      case 1:
        this.globalVar.getInstance().scheduleObj?.openEditor(data, "Add")
        break;
      case 2:
        this.globalVar.getInstance().gantt?.openAddDialog();
        break;
      case 3:
        if (this.globalVar.getInstance().gridObj) {
          this.globalVar.getInstance().gridObj.editSettings.mode = "Dialog";
        }
        this.globalVar.getInstance().gridObj?.editModule.addRecord();
        break;
    }
  }
  idExistsInArray(id: any, array: any[]) {
    return array.some(obj => obj.Id === id);
  }
}
