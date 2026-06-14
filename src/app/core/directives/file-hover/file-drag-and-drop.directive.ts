import { Directive, HostListener, HostBinding, Output, EventEmitter, Input } from '@angular/core';

@Directive({
  selector: '[fileDragDrop]'
})
export class FileDragAndDropDirective {
  //@Input() private allowed_extensions : Array<string> = ['png', 'jpg', 'bmp'];
  @Output() private filesChangeEmiter: EventEmitter<any> = new EventEmitter();

  @HostBinding('style.border') public borderStyle = '3px dashed';
  @HostBinding('style.border-color') public borderColor = '#BD965C';

  constructor() {}

  @HostListener('dragover', ['$event']) public onDragOver(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();
    this.borderColor = '#A12040';
    this.borderStyle = '3px solid';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();
    this.borderColor = '#BD965C';
    this.borderStyle = '3px dashed';
  }

  @HostListener('drop', ['$event']) public onDrop(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();

    this.borderColor = '#BD965C';
    this.borderStyle = '3px dashed';

    let files = evt.dataTransfer.files;
    this.filesChangeEmiter.emit(files);
  }
}
