import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Logo } from './logos.model';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { LogosService } from './logos.service';
import { ToastrService } from 'ngx-toastr';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-logos',
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.css'],
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule]
})
export class LogosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['logo', 'icon', 'actions'];
  dataSource: MatTableDataSource<any>;
  modalRef?: BsModalRef;
  logoForm: FormGroup;
  logo: Logo;
  logoList: Logo[] = [];
  serverFilePath: string = environment.serverFilePath;
  logoFile: File;
  iconFile: File;
  modalTitle: string;
  currentLogoId: string = '';
  logoUrl: any;
  iconUrl: any;
  safeImageUrl: SafeUrl;



  @ViewChild('exlargeModal') exlargeModal: any; // Reference to the modal template  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private cdr: ChangeDetectorRef, private toastr: ToastrService, private logosService: LogosService, private modalService: BsModalService, private fb: FormBuilder, private sanitizer: DomSanitizer, private safeUrlPipe: SafeUrlPipe) { }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.createLogoAddForm();
    this.getLogos();
  }

  getSafeImageUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  extraLarge(exlargeModal: any, logoId?: string) {
    debugger;
    if (logoId) {
      this.currentLogoId = logoId;
      console.log(this.currentLogoId, "currentlogoid");
      this.getLogoById(logoId);
    }

    this.modalRef = this.modalService.show(exlargeModal, { class: 'modal-xl' });
  }

  showToast(title: string, message: string, toastType: boolean) {
    if (toastType) {
      this.toastr.success(message, title);
    } else {
      this.toastr.warning(message, title);
    }
  }

  showErrorToast(title: string, message: string) {
    this.toastr.error(message, title);
  }

  configDataTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getLogos() {
    debugger;
    this.logosService.getLogoList().subscribe(data => {
      console.log(data, "data");
      console.log(data.logos, "data.logos");
      this.logoList = data.logos;
      this.dataSource = new MatTableDataSource(data.logos);
      this.configDataTable();
    })
  }

  getLogoById(logoId: string) {
    this.modalTitle = "Logo Düzenle";
    debugger;
    // this.clearFormGroup(this.customerAddForm);
    this.logosService.getLogoById(logoId).subscribe(data => {
      this.logo = data.logo;
      console.log(data.logo, "getById");
      this.logoForm.patchValue(data.logo);
    });
  }

  uploadFile() {
    debugger;

    if (this.currentLogoId) {
      // If productImageId is present, call updateProductImage
      this.updateLogo(this.currentLogoId);
    } else {
      // If productImageId is not present, call addProductImage
      this.addLogo();
    }

  }

  onLogoFileSelected(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.logoForm.patchValue({
      logo: file,
    });
  }

  onIconFileSelected(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.logoForm.patchValue({
      icon: file,
    });
  }

  addLogo() {
    debugger;
    const formData = new FormData();
    formData.append('logo', this.logoForm.get('logo').value);
    formData.append('icon', this.logoForm.get('icon').value);

    this.logosService.addLogo(formData).subscribe(
      (data) => {
        // Success handling        
        this.logo = new Logo();
        this.getLogos();
        // Close the modal
        this.modalRef?.hide();
        //this.clearModalContent();
        this.clearFormGroup(this.logoForm);
        this.showToast("Logo Ekleme İşlemi", "Logo ekleme işlemi başarılı.", true);
      },
      (error) => {
        this.showErrorToast(error.message, "Logo ekleme işlemi başarısız. Lütfen tekrar deneyiniz.");
      }
    );
  }

  updateLogo(logoId: string) {
    debugger;
    const formData = new FormData();
    
    const logoFile = this.logoForm.get('logo').value;
    const iconFile = this.logoForm.get('icon').value;

    if (logoFile instanceof File && logoFile.size > 0) {
      formData.append('logo', logoFile);
      formData.append('id', logoId);
    }

    if (iconFile instanceof File && iconFile.size > 0) {
      formData.append('icon', iconFile);
      formData.append('id', logoId);
    }

    if (formData.has('logo') || formData.has('icon')) {
      // At least one file is selected, proceed with the update
      this.logosService.updateLogo(formData).subscribe(
        (data) => {
          // Success handling        
          this.logo = new Logo();
          this.getLogos();
          // Close the modal
          this.modalRef?.hide();
          // this.clearModalContent();
          this.clearFormGroup(this.logoForm);
          this.showToast("Logo Güncelleme İşlemi", "Logo güncelleme işlemi başarılı.", true);
        },
        (error) => {
          this.showErrorToast(error.message, "");
        }
      );
    } else {
      // Handle the case where neither logo nor icon is selected
      console.log("No file selected for update.");
    }
  }

  deleteLogo(logoId: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Emin misiniz?',
        text: 'Silme işlemi geri alınamaz!',
        icon: 'warning',
        confirmButtonText: 'Evet, sil!',
        cancelButtonText: 'Hayır, iptal et!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          this.logosService.deleteLogo(logoId).subscribe(data => {
            this.logoList = this.logoList.filter(x => x.id != logoId);
            this.dataSource = new MatTableDataSource(this.logoList);
            this.configDataTable();
            swalWithBootstrapButtons.fire(
              'Silindi!',
              'Silme işlemi başarılı.',
              'success'
            );
          })

        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'İptal edildi.',
            'Silme işlemi iptal edildi.',
            'error'
          );
        }
      });
  }

  createLogoAddForm() {
    this.logoForm = this.fb.group({
      id: [null],
      icon: [''],
      logo: ['']
    });
  }


  clearFormGroup(group: FormGroup) {
  }

}
