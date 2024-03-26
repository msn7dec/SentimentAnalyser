import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';  // <<<< import it here
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login.component';
import { CommentEvaluationService } from './coomment-evaluation.service';
import { HttpClientModule } from '@angular/common/http';
import { CaptionComponent } from './caption.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    DashboardComponent,
    CaptionComponent
  ],
  imports: [
    BrowserModule, FormsModule, AppRoutingModule, HttpClientModule // <<<< And here
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }