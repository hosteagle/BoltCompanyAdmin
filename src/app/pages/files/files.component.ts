import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../categories/categories.model';
import { CategoriesService } from '../categories/categories.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css'],
  standalone: true,
  imports: [FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe
  ],
})
export class FilesComponent implements OnInit {
  categoryList: Category[];
  selectedCategory: string;

  constructor(private c: CategoriesService) { }
  ngOnInit() {
    this.c.getCategoryList().subscribe(data => {
      this.categoryList = data.categories;
    });
    
  }

}

