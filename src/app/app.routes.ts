import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ExpenseListComponent } from './pages/expenses/expense-list.component';
import { ExpenseFormComponent } from './pages/expenses/expense-form.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminUsersComponent } from './pages/admin/admin-users.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'expenses',
    component: ExpenseListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'expenses/new',
    component: ExpenseFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'expenses/:id/edit',
    component: ExpenseFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminUsersComponent,
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];
