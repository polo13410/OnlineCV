import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule, MatAccordion } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { GetJsonService } from '../services/get-json.service';
import { Experiences } from 'src/assets/data/contentInterface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatButtonModule, MatIconModule, MatCardModule, MatDividerModule]
})
export class ExperiencesComponent implements OnInit, OnDestroy {
  @ViewChild('accordion') accordion: MatAccordion | undefined
  experiences?: Experiences |undefined
  accordeonToggleIcon?: string |undefined = "unfold_more";
  private destroy$ = new Subject<void>();

  constructor (private readonly json: GetJsonService) {}

  ngOnInit (): void {
    this.json.getExp(0)?.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data =>  {
      this.experiences = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleAccordeon(){
    if(this.accordeonToggleIcon == "unfold_more"){
      this.accordeonToggleIcon = "unfold_less";
      this.accordion?.openAll()
    } else{
      this.accordeonToggleIcon = "unfold_more";
      this.accordion?.closeAll()
    }
  }

}
