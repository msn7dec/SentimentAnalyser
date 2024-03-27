import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CaptionService } from './caption-service';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

interface Image {
    id: number;
    text: string;
    file: any;
    image_desc: string;
    caption: string;
    image_url: any;
  }

@Component({
    standalone: true,
    selector: 'app-caption',
    imports: [FormsModule, RouterModule, CommonModule, HttpClientModule],
    templateUrl: './caption.component.html',
    styleUrls: ['./caption.component.css'],
    providers: [CaptionService]
})

export class CaptionComponent implements OnInit {

    imageUrl: string | null = null;
    generatedCaption: string | null = null;
    dragOver: boolean = false;
    selectedFile: File | null = null;
    isAddSpinerLoading: boolean = false;
    imagesObject: any = [];
    
    constructor(private captionService: CaptionService, private sanitizer: DomSanitizer) { }
    
    ngOnInit() {
        this.getImages();
    }

    getImages() {
        this.captionService.getImages().subscribe(
            (response) => {
                console.log(response);
                for (let i = 0; i < response.length; i++) {
                    let objectURL = 'data:image/jpeg;base64,' + response[0].file;
                    console.log(objectURL);
                    response[0].image_url = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                }
                this.imagesObject = response
            },
            (error) => {
                console.error('Error fetching images:', error);
            }
        );
    }

    activeLink = 'caption';

    setActiveLink(link: string) {
        this.activeLink = link;
    }

    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedFile = file;
            this.handleFile(file);
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.dragOver = true;
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedFile = file;
            this.handleFile(file);
        }
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        this.dragOver = false;
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedFile = file;
            this.handleFile(file);
        }
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        this.dragOver = false;
        const file = event.dataTransfer?.files[0];
        if (file) {
            this.selectedFile = file;
            this.handleFile(file);
        }
    }

    handleFile(file: File) {
        this.imageUrl = URL.createObjectURL(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.selectedFile = file;
            this.imageUrl = reader.result as string;
        };
        
    }

    generateCaption() {
        if (this.selectedFile) {
            this.isAddSpinerLoading = true;
            const reader = new FileReader();
            if (this.selectedFile) {
                reader.readAsArrayBuffer(this.selectedFile);
            }

            reader.onload = () => {
                if (reader.result) {
                    const blob = new Blob([reader.result], { type: this.selectedFile!.type });
                    console.log('reader.result object is' , reader.result);
                    const formData = new FormData();
                    formData.append('image', blob, this.selectedFile?.name);
                    this.captionService.getCaption(formData)
                        .subscribe(
                            (response) => {
                                console.log("Inside the success");
                                console.log(response.generated_text)
                                this.generatedCaption = response.generated_text;
                                this.isAddSpinerLoading = false;
                            },
                            (error) => {
                                console.error('Error generating caption:', error);
                                this.isAddSpinerLoading = false;
                            }
                        );
                }
            }


        }
    }

}







