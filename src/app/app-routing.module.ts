import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { FormationsComponent } from './formations/formations.component';
import { ExperiencesComponent } from './experiences/experiences.component';
import { SkillsComponent } from './skills/skills.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RouteResolver } from './resolvers/route.resolver';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'edu', component: FormationsComponent },
  { path: 'exp', component: ExperiencesComponent },
  {
    path: 'skills',
    pathMatch: 'full',
    component: SkillsComponent,
    resolve: {
      skills: RouteResolver
    }
  },
  // { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [RouteResolver]
})
export class AppRoutingModule {}
