import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component'
import { FormationsComponent } from './formations/formations.component';
import { ExperiencesComponent } from './experiences/experiences.component';
import { SkillsComponent } from './skills/skills.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'edu', component: FormationsComponent },
  { path: 'exp', component: ExperiencesComponent },
  { path: 'skills', component: SkillsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
