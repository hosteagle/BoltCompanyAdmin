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
import { MatGridListModule } from '@angular/material/grid-list';
import { EditorModule } from '@tinymce/tinymce-angular';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Product, ProductImage } from './productsAndImages.model';
import { ProductDto, ProductImageDto, ProductImagesDto, ProductsDto } from './productAndImage.dto';
import { environment } from 'src/environments/environment';
import { ProductsAndImagesService } from './productsAndImages.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
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
    MatIconModule,
    MatGridListModule,
    EditorModule]
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'actions'];
  dataSourceProduct: MatTableDataSource<any>;
  dataSourceProductImage: MatTableDataSource<any>;
  modalRef?: BsModalRef;
  productForm: FormGroup;
  productImageForm: FormGroup;
  product: Product;
  productImage: ProductImage;
  productList: Product[];
  productImageList: ProductImage[];
  productsDto: ProductsDto;
  productImagesDto: ProductImagesDto;
  productDto: ProductDto = { product: null, message: '', statusCode: '' };
  productImageDto: ProductImageDto = { productImage: null, message: '', statusCode: '' };
  modalTitle: string;
  apiKey: string = environment.tinymceEditorApiKey;
  editorConfig: any;

  @ViewChild('exlargeModal') exlargeModal: any; // Reference to the modal template  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(private toastr: ToastrService, private productAndImageService: ProductsAndImagesService, private modalService: BsModalService, private fb: FormBuilder) {
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



  ngOnInit() {
    this.getProducts();
    this.createProductAddForm(); // Add this line
  }

  ngAfterViewInit() {
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

  extraLarge(exlargeModal: any) {
    this.modalRef = this.modalService.show(exlargeModal, { class: 'modal-xl' });
  }

  configDataTable() {
    this.dataSourceProduct.paginator = this.paginator;
    this.dataSourceProduct.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceProduct.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceProduct.paginator) {
      this.dataSourceProduct.paginator.firstPage();
    }
  }

  getProducts() {
    debugger;
    this.productAndImageService.getProductList().subscribe(data => {
      console.log(data, "data");
      console.log(data.products, "data.products");
      this.productList = data.products;
      this.dataSourceProduct = new MatTableDataSource(data.products);
      this.configDataTable();
    })
  }

  getProductById(productId: string) {
    this.modalTitle = "Ürün Düzenle";
    debugger;
    // this.clearFormGroup(this.customerAddForm);
    this.productAndImageService.getProductById(productId).subscribe(data => {
      this.productDto.product = data.product;
      console.log(data.product, "getById");

      this.productForm.patchValue(data.product);
    });
  }

  extraLargeDetails(exlargeModal: any, productId: string) {
    this.modalTitle = "Ürün Detayı"; // Modal başlığını belirle
    this.productAndImageService.getProductById(productId).subscribe(data => {
      this.productDto.product = data.product;
      console.log(data.product, "getById");
      this.modalRef = this.modalService.show(exlargeModal, { class: 'modal-xl' }); // Modal'ı aç
    });
  }

  save() {
    debugger;
    console.log('Form controls:', this.productForm.controls);

    if (this.productForm.valid) {
      this.product = this.productForm.value;

      if (!this.product.id) {
        this.addProduct();
      } else {
        this.updateProduct();
      }

      // Close the modal if the form is valid
      this.modalRef?.hide();
    } else {
      console.log('Form is invalid. Validation errors:', this.productForm.errors);
    }
  }

  addProduct() {
    if (this.productForm.valid) {
      this.productAndImageService.addProduct(this.product).subscribe(data => {
        this.getProducts();
        this.product = new Product();
        // Close the modal
        this.modalRef?.hide();
        this.clearProductFormGroup(this.productForm);
        this.showToast("Ürün Ekleme İşlemi", "Ürün ekleme işlemi başarılı.", true);
      }, error => {
        //	this.alertifyService.error("Bu müşteri veritabanında mevcut.");
        this.showErrorToast("Eklemek istediğiniz ürün verisi veritabanında mevcut.", "");
      })
    }
  }

  updateProduct() {
    if (this.productForm.valid) {
      this.productAndImageService.updateProduct(this.product).subscribe(data => {

        var index = this.productList.findIndex(x => x.id == this.product.id);
        this.productList[index] = this.product;
        this.dataSourceProduct = new MatTableDataSource(this.productList);
        this.configDataTable();
        this.product = new Product();
        this.modalRef?.hide();
        this.clearProductFormGroup(this.productForm);
        this.showToast("Ürün Güncelleme İşlemi", "Ürün güncelleme işlemi başarılı.", false);
      }, error => {
        //	this.alertifyService.error("Bu müşteri veritabanında mevcut.");
        this.showErrorToast("Güncelleme işlemi başarısız.", "");
      })
    }
  }

  deleteProduct(productId: string) {
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
          this.productAndImageService.deleteProduct(productId).subscribe(data => {
            this.productList = this.productList.filter(x => x.id != productId);
            this.dataSourceProduct = new MatTableDataSource(this.productList);
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

  createProductAddForm() {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: ['', Validators.required],
      specification: ['', Validators.required],
      createdDate: '',
      updatedDate: '',
      isModified: [false],
      isDeleted: [false]
    });
  }

  createProductImageAddForm() {
    this.productImageForm = this.fb.group({
      id: [null],
      imageUrl: ['', Validators.required],
      productId: ['', Validators.required],
      isCoverImage: [false],
      createdDate: '',
      updatedDate: '',
      isModified: [false],
      isDeleted: [false]
    });
  }

  clearProductFormGroup(group: FormGroup) {

    group.markAsUntouched();
    group.reset();

    Object.keys(group.controls).forEach(key => {
      group.get(key).setErrors(null);
      if (key == 'id')
        group.get(key).setValue("");
      if (key == 'name')
        group.get(key).setValue("");
      if (key == 'description')
        group.get(key).setValue("");
      if (key == 'specification')
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

  clearProductImageFormGroup(group: FormGroup) {

    group.markAsUntouched();
    group.reset();

    Object.keys(group.controls).forEach(key => {
      group.get(key).setErrors(null);
      if (key == 'id')
        group.get(key).setValue("");
      if (key == 'imgUrl')
        group.get(key).setValue("");
      if (key == 'productId')
        group.get(key).setValue("");
      if (key == 'isCoverImage')
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
