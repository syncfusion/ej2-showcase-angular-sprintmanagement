import { Component, ViewChild } from '@angular/core';
import { DateRangePickerComponent} from '@syncfusion/ej2-angular-calendars';
import { DataService } from 'src/app/data.service';

@Component({
    selector: 'timerange',
    templateUrl: './timerange.component.html',
})
export class TimeRangeAppComponent {
    @ViewChild('timerangecompo1')
    public dateRangeInstance?: DateRangePickerComponent;
    public startDate?: Date
    public endDate?: Date
    constructor(private globalVar:DataService) {
    }
    public ngOnInit(): void {
        this.startDate = new Date(2021, 0, 1);
        this.endDate = new Date(2021, 0, 15);
    }
    change(args: any) {
        const projectValue = this.globalVar.getInstance().topDropDownInstance.value;
        const resourceValue = this.globalVar.resourceSelectValue;
        // @ts-ignore
        const currentData = this.globalVar[`sprintData${(projectValue as string).slice(-1)}`] as any;
        const isDateRangeValid = args.text !== '';
        const matchedItems = currentData.filter((item: { StartTime: string | number | Date; EndTime: string | number | Date; }) => {
            const itemStartDate = new Date(item.StartTime);
            const itemEndDate = new Date(item.EndTime);

            const dateMatch =
                !isDateRangeValid ||
                (itemStartDate >= args.startDate && itemEndDate <= args.endDate);

            return dateMatch;
        });
        if (resourceValue) {
            const resourceMatchedItems = resourceValue
                ? matchedItems.filter((item: { resources: any; }) => {
                    return item.resources === resourceValue;
                })
                : matchedItems;

            this.globalVar.updateCommonDataAndRefreshComponents(resourceMatchedItems);
        } else if (!resourceValue || resourceValue.length == 0) {
            this.globalVar.updateCommonDataAndRefreshComponents(matchedItems);
        }
    }
    gettimerangeObj(): DateRangePickerComponent | undefined {
        return this.dateRangeInstance;
    }
}