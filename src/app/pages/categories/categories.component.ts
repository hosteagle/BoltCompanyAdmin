import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { EditorModule } from '@tinymce/tinymce-angular';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { Category } from './categories.model';
import { CategoriesDto, CategoryDto } from './categories.dto';
import { ToastrService } from 'ngx-toastr';
import { CategoriesService } from './categories.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatMenuModule, MatButtonModule, MatDividerModule, MatIconModule, EditorModule]
})
export class CategoriesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'actions'];
  dataSource: MatTableDataSource<any>;
  modalRef?: BsModalRef;
  categoryForm: FormGroup;
  category: Category;
  categoryList: Category[];
  categoriesDto: CategoriesDto;
  categoryDto: CategoryDto = { category: null, message: '', statusCode: '' };
  modalTitle: string;

  @ViewChild('exlargeModal') exlargeModal: any; // Reference to the modal template  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private toastr: ToastrService, private categoryService: CategoriesService, private modalService: BsModalService, private fb: FormBuilder) {
   }

  ngOnInit() {
    this.createCategoryAddForm(); // Add this line
    this.getCategories();
  }

  ngAfterViewInit() {
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

  getCategories() {
    this.categoryService.getCategoryList().subscribe(data => {
      console.log(data, "data");
      console.log(data.categories, "data.categories");
      this.categoryList = data.categories;
      this.dataSource = new MatTableDataSource(data.categories);
      this.configDataTable();
    })
  }

  getCategoryById(categoryId: string) {
    this.modalTitle = "Kategori Düzenle";
    debugger;
    // this.clearFormGroup(this.customerAddForm);
    this.categoryService.getCategoryById(categoryId).subscribe(data => {
      this.categoryDto.category = data.category;
      console.log(data.category, "getById");

      this.categoryForm.patchValue(data.category);
    });
  }

  save() {
    debugger;
    console.log('Form controls:', this.categoryForm.controls);

    if (this.categoryForm.valid) {
      this.category = this.categoryForm.value;

      if (!this.category.id) {
        this.addCategory();
      } else {
        this.updateCategory();
      }

      // Close the modal if the form is valid
      this.modalRef?.hide();
    } else {
      console.log('Form is invalid. Validation errors:', this.categoryForm.errors);
    }
  }

  addCategory() {
    if (this.categoryForm.valid) {
      this.categoryService.addCategory(this.category).subscribe(data => {
        this.getCategories();
        this.category = new Category();
        // Close the modal
        this.modalRef?.hide();
        this.clearFormGroup(this.categoryForm);
        this.showToast("Kategori Ekleme İşlemi","Kategori ekleme işlemi başarılı.", true);
      }, error => {
        //	this.alertifyService.error("Bu müşteri veritabanında mevcut.");
        this.showErrorToast("Eklemek istediğiniz kategori verisi veritabanında mevcut.","");
      })
    }
  }

  updateCategory() {
    if (this.categoryForm.valid) {
      this.categoryService.updateCategory(this.category).subscribe(data => {

        var index = this.categoryList.findIndex(x => x.id == this.category.id);
        this.categoryList[index] = this.category;
        this.dataSource = new MatTableDataSource(this.categoryList);
        this.configDataTable();
        this.category = new Category();
        this.modalRef?.hide();
        this.clearFormGroup(this.categoryForm);
        this.showToast("Kategori Güncelleme İşlemi","Kategori güncelleme işlemi başarılı.", false);
      }, error => {
        //	this.alertifyService.error("Bu müşteri veritabanında mevcut.");
        this.showErrorToast("Güncelleme işlemi başarısız.","");
      })
    }
  }

  deleteCategory(categoryId: string) {
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
          this.categoryService.deleteCategory(categoryId).subscribe(data => {
            this.categoryList = this.categoryList.filter(x => x.id != categoryId);
            this.dataSource = new MatTableDataSource(this.categoryList);
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


  createCategoryAddForm() {
    this.categoryForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
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
