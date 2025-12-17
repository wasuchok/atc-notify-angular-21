import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertCenterComponent } from './shared/alert/alert-center.component';
import { SwalOverlayComponent } from './shared/swal/swal-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertCenterComponent, SwalOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
