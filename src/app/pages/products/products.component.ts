import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Product, ProductImage } from './productsAndImages.model';
import { ProductDto, ProductImageDto, ProductImagesDto, ProductsDto } from './productAndImage.dto';
import { environment } from 'src/environments/environment';
import { ProductsAndImagesService } from './productsAndImages.service';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
    EditorModule,
    DropzoneModule]
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'actions'];
  dataSourceProduct: MatTableDataSource<any>;
  dataSourceProductImage: MatTableDataSource<any>;
  modalRef?: BsModalRef;
  largeModalRef?: BsModalRef;
  productForm: FormGroup;
  productImageForm: FormGroup;
  product: Product;
  productImage: ProductImage = new ProductImage();
  productList: Product[];
  productImageList: ProductImage[];
  productsDto: ProductsDto;
  productImagesDto: ProductImagesDto;
  productDto: ProductDto = { product: null, message: '', statusCode: '' };
  productImageDto: ProductImageDto = { productImage: null, message: '', statusCode: '' };
  modalTitle: string;
  apiKey: string = environment.tinymceEditorApiKey;
  serverFilePath: string = environment.serverFilePath;
  editorConfig: any;
  files: File[] = [];
  currentProductId: string;
  currentProductImageId: string;

  @ViewChild('exlargeModal') exlargeModal: any; // Reference to the modal template  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(private cdr: ChangeDetectorRef, private toastr: ToastrService, private productAndImageService: ProductsAndImagesService, private modalService: BsModalService, private fb: FormBuilder,private sanitizer: DomSanitizer) {
    this.editorConfig = {
      plugins: 'ai tinycomments mentions anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
      toolbar: 'undo redo | blocks fontfamily fontsize | forecolor backcolor | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
      tinycomments_mode: 'embedded',
      tinycomments_author: 'Author name',
      ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),

    };
  }



  ngOnInit() {
    this.getProducts();
    this.createProductAddForm(); // Add this line
    this.createProductImageAddForm();
  }

  ngAfterViewInit() {
  }

  // file upload
  public dropzoneConfig: DropzoneConfigInterface = {
    clickable: true,
    addRemoveLinks: true,
    previewsContainer: false
  };

  uploadedFiles: any[] = [];

  getSafeImageUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  
  // File Upload
  imageURL: any;
  onUploadSuccess(event: any) {
    setTimeout(() => {
      this.uploadedFiles.push(event[0]);
    }, 0);
  }

  // File Remove
  removeFile(event: any) {
    this.uploadedFiles.splice(this.uploadedFiles.indexOf(event), 1);
  }

  //Content

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

  extraLarge(exlargeModal: any, productId?: string) {
    debugger;
    this.currentProductId = productId;
    if (productId) {
      this.getProductImagesByProductId(productId);
      this.modalRef = this.modalService.show(exlargeModal, { class: 'modal-xl' });
    } else{
      this.modalRef = this.modalService.show(exlargeModal, { class: 'modal-xl' });
    }
  }

  largeModal(largeDataModal: any, productId?: string) {
    this.currentProductId = productId;
    this.largeModalRef = this.modalService.show(largeDataModal, { class: 'modal-lg' });
  }

  closeLargeModal(){
    this.largeModalRef?.hide();
    this.clearModalContent();
  }
  largeImageModal(largeDataModal: any, productId?: string, productImageId?: string) {
    debugger;
    this.currentProductId = productId;
    this.currentProductImageId = productImageId;
    this.largeModalRef = this.modalService.show(largeDataModal, { class: 'modal-lg' });
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

  getProductImagesByProductId(productId: string) {
    debugger;
    this.productAndImageService.getProductImageListByProductId(productId).subscribe(data => {
      console.log(data, "data");
      console.log(data.productImages, "data.productImages");
      this.productImageList = data.productImages;
      console.log(this.productImageList, "this.productImageList");

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

  uploadFile(productId: string, productImageId?: string) {
    debugger;
    let isCoverImage;
    if (this.productImageForm.get('isCoverImage')) {
      isCoverImage = this.productImageForm.get('isCoverImage')?.value;
    }
    if (this.uploadedFiles.length > 0 || !productImageId) {
      const files = this.uploadedFiles;
      if (productImageId) {
        // If productImageId is present, call updateProductImage
        this.updateProductImage(isCoverImage, productId, files, productImageId);
      } else {
        // If productImageId is not present, call addProductImage
        this.addProductImage(productId, files);
      }
    } else {
      // Handle case when no files are selected or no productImageId is provided
    }
  }
  
  addProductImage(productId: string, files: File[]) {
    debugger;
    const formData = new FormData();
    // Append each file to the FormData
    for (let i = 0; i < files.length; i++) {
      formData.append('Files', files[i]);
    }
    formData.append('productId', productId);

    const productImage: ProductImage = {
      productId: productId,
      files: files,
    };
  
    this.productAndImageService.addProductImage(formData, productImage).subscribe(
      (data) => {
        // Success handling        
        this.productImage = new ProductImage();
        // Close the modal
        this.largeModalRef?.hide();
        this.clearModalContent();
        this.clearProductImageFormGroup(this.productImageForm);
        this.showToast("Ürün fotoğrafı Ekleme İşlemi", "Ürün fotoğrafı ekleme işlemi başarılı.", true);
      },
      (error) => {
        this.showErrorToast(error.message, "");
      }
    );
  }
  
  updateProductImage(isCoverImage: boolean, productId: string, files: File[], productImageId: string) {
    debugger;
    const formData = new FormData();
    // Append each file to the FormData
    for (let i = 0; i < files.length; i++) {
      formData.append('Files', files[i]);
    }
  
    formData.append('productId', productId);
    formData.append('id', productImageId);
    formData.append('isCoverImage',isCoverImage.toString());
    this.productAndImageService.updateProductImage(formData).subscribe(
      (data) => {
        // Success handling        
        this.productImage = new ProductImage();
        // Close the modal
        this.largeModalRef?.hide();
        this.clearModalContent();
        this.clearProductImageFormGroup(this.productImageForm);
        this.showToast("Ürün Fotoğrafı Güncelleme İşlemi", "Ürün fotoğrafı güncelleme işlemi başarılı.", true);
      },
      (error) => {
        this.showErrorToast(error.message, "");
      }
    );
  }
  /* 
  updateProductImage(isPrimary: boolean) {
    if (this.productImageForm.valid) {
      const formData = new FormData();
      const productImage: ProductImage = this.productImageForm.value;
  
      // Append each file to the FormData
      for (let i = 0; i < this.uploadedFiles.length; i++) {
        formData.append('Files', this.uploadedFiles[i]);
      }
      
      formData.append('productId', productImage.productId);
  
      // Add isPrimary value to the form data
      formData.append('isPrimary', isPrimary.toString());
  
      // Check if productImage has an id (update operation) and add it to the form data
      if (productImage.id) {
        formData.append('productImageId', productImage.id);
      }
  
      // Call the updateProductImage method in the service
      this.productAndImageService.updateProductImage(formData,productImage).subscribe(
        (data) => {
          // Success handling        
          this.productImage = new ProductImage();
          // Close the modal
          this.largeModalRef?.hide();
          this.clearProductImageFormGroup(this.productImageForm);
          this.showToast("Ürün Fotoğrafı Güncelleme İşlemi", "Ürün fotoğrafı güncelleme işlemi başarılı.", true);
        },
        (error) => {
          this.showErrorToast(error.message, "");
        }
      );
    } else {
      // Handle form validation errors
      // For example, show an error message or highlight the invalid fields
    }
  }
*/
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
      files: [null, Validators.required],
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
        group.get(key).setValue(false);
        if (key == 'files')
        group.get(key).setValue(null);
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

  clearModalContent() {
    this.productImageForm.reset();
    this.uploadedFiles = [];
    this.currentProductImageId = null;
  
    // Change detection'ı manuel olarak tetikle
    this.cdr.detectChanges();
  }
}
