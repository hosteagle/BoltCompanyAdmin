import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AboutsService } from './abouts.service';
import { About } from './abouts.model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AboutDto, AboutsDto } from './abouts.dto';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { EditorModule } from '@tinymce/tinymce-angular';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-abouts',
  templateUrl: './abouts.component.html',
  styleUrls: ['./abouts.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatMenuModule, MatButtonModule, MatDividerModule, MatIconModule, EditorModule]
})
export class AboutsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'title', 'description', 'actions'];
  dataSource: MatTableDataSource<any>;
  modalRef?: BsModalRef;
  aboutForm: FormGroup;
  about: About;
  aboutList: About[];
  aboutsDto: AboutsDto;
  aboutDto: AboutDto = { about: null, message: '', statusCode: '' };
  modalTitle: string;
  apiKey: string = environment.tinymceEditorApiKey;
  editorConfig: any;

  @ViewChild('exlargeModal') exlargeModal: any; // Reference to the modal template  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private toastr: ToastrService, private aboutService: AboutsService, private modalService: BsModalService, private fb: FormBuilder) {
    this.editorConfig = {
      plugins: 'ai tinycomments mentions anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
      toolbar: 'undo redo | blocks fontfamily fontsize | forecolor backcolor | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
      tinycomments_mode: 'embedded',
      tinycomments_author: 'Author name',
      mergetags_list: [
        { value: 'First.Name', title: 'First Name' },
        { value: 'Email', title: 'Email' },
      ],
      ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
    
    };
   }

  ngOnInit(): void {
    this.createAboutAddForm(); // Add this line
    this.getAbouts();
  }
  ngAfterViewInit(): void {

  }

  showToast(title:string, message: string, toastType: boolean) {
    if (toastType) {
      this.toastr.success(message, title);
    } else {
      this.toastr.warning(message, title);
    }
  }

  showErrorToast(title:string, message: string){
    this.toastr.error(message,title);
  }

  extraLarge(exlargeModal: any) {
    this.modalRef = this.modalService.show(exlargeModal, { class: 'modal-xl' });
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


  getAbouts() {
    this.aboutService.getAboutList().subscribe(data => {
      console.log(data, "data");
      console.log(data.abouts, "data.abouts");
      this.aboutList = data.abouts;
      this.dataSource = new MatTableDataSource(data.abouts);
      this.configDataTable();
    })
  }

  getAboutById(aboutId: string) {
    this.modalTitle = "Hakkımızda Düzenle";
    debugger;
    // this.clearFormGroup(this.customerAddForm);
    this.aboutService.getAboutById(aboutId).subscribe(data => {
      this.aboutDto.about = data.about;
      console.log(data.about, "getById");

      this.aboutForm.patchValue(data.about);
    });
  }

  save() {
    debugger;
    console.log('Form controls:', this.aboutForm.controls);

    if (this.aboutForm.valid) {
      this.about = this.aboutForm.value;

      if (!this.about.id) {
        this.addAbout();
      } else {
        this.updateAbout();
      }

      // Close the modal if the form is valid
      this.modalRef?.hide();
    } else {
      console.log('Form is invalid. Validation errors:', this.aboutForm.errors);
    }
  }

  addAbout() {
    if (this.aboutForm.valid) {
      this.aboutService.addAbout(this.about).subscribe(data => {
        this.getAbouts();
        this.about = new About();
        // Close the modal
        this.modalRef?.hide();
        this.clearFormGroup(this.aboutForm);
        this.showToast("Hakkımızda Ekleme İşlemi","Hakkımızda ekleme işlemi başarılı.", true);
      }, error => {
        //	this.alertifyService.error("Bu müşteri veritabanında mevcut.");
        this.showErrorToast("Eklemek istediğiniz hakkımızda verisi veritabanında mevcut.","");
      })
    }
  }

  updateAbout() {
    if (this.aboutForm.valid) {
      this.aboutService.updateAbout(this.about).subscribe(data => {

        var index = this.aboutList.findIndex(x => x.id == this.about.id);
        this.aboutList[index] = this.about;
        this.dataSource = new MatTableDataSource(this.aboutList);
        this.configDataTable();
        this.about = new About();
        this.modalRef?.hide();
        this.clearFormGroup(this.aboutForm);
        this.showToast("Hakkımızda Güncelleme İşlemi","Hakkımızda güncelleme işlemi başarılı.", false);
      }, error => {
        //	this.alertifyService.error("Bu müşteri veritabanında mevcut.");
        this.showErrorToast("Güncelleme işlemi başarısız.","");
      })
    }
  }


  deleteAbout(aboutId: string) {
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
          this.aboutService.deleteAbout(aboutId).subscribe(data => {
            this.aboutList = this.aboutList.filter(x => x.id != aboutId);
            this.dataSource = new MatTableDataSource(this.aboutList);
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


  createAboutAddForm() {
    this.aboutForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: ['', Validators.required],
      createdDate: '',
      updatedDate: '',
      isModified: [false],
      isDeleted: [false]
    });
  }

  clearFormGroup(group: FormGroup) {

    group.markAsUntouched();
    group.reset();

    Object.keys(group.controls).forEach(key => {
      group.get(key).setErrors(null);
      if (key == 'id')
        group.get(key).setValue("");
      if (key == 'title')
        group.get(key).setValue("");
      if (key == 'description')
        group.get(key).setValue("");
        if (key == 'createdDate')
        group.get(key).setValue(null);
        if (key == 'updatedDate')
        group.get(key).setValue(null);
        if (key == 'isModified')
        group.get(key).setValue(false);
        if (key == 'isDeleted')
        group.get(key).setValue(false);
    });
    this.modalRef?.hide();
  }
  
}
