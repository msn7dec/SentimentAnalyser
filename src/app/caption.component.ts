import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CaptionService } from './caption-service';
import { HttpClientModule } from '@angular/common/http';


@Component({
    standalone: true,
    selector: 'app-caption',
    imports: [FormsModule, RouterModule, CommonModule, HttpClientModule],
    templateUrl: './caption.component.html',
    styleUrls: ['./caption.component.css'],
    providers: [CaptionService]
})

export class CaptionComponent {

    imageUrl: string | null = null;
    generatedCaption: string | null = null;
    dragOver: boolean = false;
    selectedFile: File | null = null;
    isAddSpinerLoading: boolean = false;

    constructor(private captionService: CaptionService) { }

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
        reader.onload = () => {
            this.selectedFile = file;
            this.imageUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    generateCaption() {
        if (this.selectedFile) {
            this.isAddSpinerLoading = true;
            const formData = new FormData();
            formData.append('image', this.selectedFile);
            console.log(this.selectedFile);
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




