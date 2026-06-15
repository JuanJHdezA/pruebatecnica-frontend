import { Component, input, output } from '@angular/core';
import { PrimeNGModule } from '@modules/primeng.module';

@Component({
  selector: 'app-file-uploader',
  imports: [PrimeNGModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.scss'
})
export class FileUploaderComponent {
  loading = input<boolean>(false);
  imageBase64 = input<string>('');

  fileSelected = output<Event>();
  removeImage = output<void>();

  onFileSelected(event: Event) {
    this.fileSelected.emit(event);
  }

  removerImagenAdunta() {
    this.removeImage.emit();
  }
}
