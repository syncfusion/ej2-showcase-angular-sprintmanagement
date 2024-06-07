import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { KanbanModule } from '@syncfusion/ej2-angular-kanban';
import { AgendaService, DragAndDropService, ResizeService, ScheduleModule, TimelineViewsService } from '@syncfusion/ej2-angular-schedule';
import { GanttAllModule } from '@syncfusion/ej2-angular-gantt';
import { GridAllModule } from '@syncfusion/ej2-angular-grids';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { TimeRangeAppComponent} from '../app/home/timerange/timerange.component';
import { DropDownAppComponent} from '../app/home/dropdown-list/dropdown-list.component';
import { KanbanAppComponent} from '../app/home/kanban/kanban.component';
import { ScheduleAppComponent } from '../app/home/schedule/schedule.component';
import { GanttAppComponent } from '../app/home/gantt/gantt.component';
import { GridAppComponent } from '../app/home/grid/grid.component';
import { DataService } from './data.service';
import { GroupService, SortService, GridComponent, EditService, ToolbarService, GridModule, PageService } from '@syncfusion/ej2-angular-grids'
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    TimeRangeAppComponent,
    DropDownAppComponent,
    KanbanAppComponent,
    ScheduleAppComponent,
    GanttAppComponent,
    GridAppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DateRangePickerModule,
    DropDownListModule,
    KanbanModule,
    ScheduleModule,
    GanttAllModule,
    GridAllModule,
    FormsModule
  ],
  providers: [KanbanAppComponent,ScheduleAppComponent,GanttAppComponent,GridAppComponent,DropDownAppComponent,
    TimeRangeAppComponent,HomeComponent,DataService,GroupService, ToolbarService, SortService, EditService, PageService,TimelineViewsService, AgendaService, ResizeService, DragAndDropService],
  bootstrap: [AppComponent]
})
export class AppModule { }
