import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { Passion } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-passions',
  templateUrl: './passions.component.html',
  styleUrl: './passions.component.scss',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, TranslateModule],
})
export class PassionsComponent implements OnInit, OnDestroy {

  passions: Passion[] = [];
  sports: string[] = [];
  others: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(private readonly json: GetJsonService) { }

  ngOnInit(): void {
    this.json.getPassions()?.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.sports = [];
      this.others = [];
      data.forEach((element: Passion) => {
        if(element.type == "sport"){
          this.sports.push(element.name)
        } else {
          this.others.push(element.name)
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
