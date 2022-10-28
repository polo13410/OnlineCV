import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomepageComponent } from './homepage/homepage.component'
import { FormationsComponent } from './formations/formations.component'
import { ExperiencesComponent } from './experiences/experiences.component'
import { SkillsComponent } from './skills/skills.component'
import { NotFoundComponent } from './not-found/not-found.component'

const routes: Routes = [
  { path: 'home', component: HomepageComponent },
  { path: 'edu', component: FormationsComponent },
  { path: 'exp', component: ExperiencesComponent },
  { path: 'skills', component: SkillsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
