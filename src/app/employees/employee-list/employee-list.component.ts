import { Component, OnInit, ViewChild } from '@angular/core';
import { EmployeeService } from '../shared/employee.service';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { DepartmentService } from '../shared/department.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { EmployeeComponent } from '../employee/employee.component';
import { NotificationService } from '../shared/notification.service';
import { DialogService } from '../shared/dialog.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  constructor(
    public service: EmployeeService,
    public departmentService: DepartmentService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private dialogService: DialogService
  ) {}

  searchkey: string;
  listData: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'fullName',
    'email',
    'mobile',
    'city',
    'departmentName',
    'actions'
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit() {
    this.service.getEmployees().subscribe(list => {
      let array = list.map(item => {
        let departmentName = this.departmentService.getDepartmentName(
          item.payload.val()['department']
        );

        return {
          $key: item.key,
          departmentName,
          ...item.payload.val()
        };
      });
      this.listData = new MatTableDataSource(array);
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
      this.listData.filterPredicate = (data, filter) => {
        return this.displayedColumns.some(ele => {
          return (
            ele != 'actions' && data[ele].toLowerCase().indexOf(filter) != -1
          );
        });
      };
    });
  }

  applyFilter() {
    this.listData.filter = this.searchkey.trim().toLowerCase();
  }

  onSearchClear() {
    this.searchkey = '';
    this.applyFilter();
  }

  onCreate() {
    this.service.initializeFormGroup();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(EmployeeComponent, dialogConfig);
  }

  onEdit(employee) {
    this.service.populateForm(employee);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(EmployeeComponent, dialogConfig);
  }

  onDelete(employeeId) {
    this.dialogService
      .openConfirmDialog('Are you sure to delete this record ?')
      .afterClosed()
      .subscribe(res => {
        if (res) {
          this.service.deleteEmployee(employeeId);
          this.notificationService.warn('! Deleted Successfully');
        }
      });
  }
}
