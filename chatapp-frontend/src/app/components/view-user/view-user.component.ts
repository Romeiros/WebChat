import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as M from 'materialize-css';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import io from 'socket.io-client';

import { UsersService } from 'src/app/services/users.service';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css']
})
export class ViewUserComponent implements OnInit, AfterViewInit {

  tabElement: any;
  postsTab = false;
  followingTab = false;
  followersTab = false;
  socket: any;
  posts = [];
  following = [];
  followers = [];
  user: any;
  name: any;
  nameFromUserData: any;
  postValue: any;
  editForm: FormGroup;
  modalElement: any;

  constructor(
    private route: ActivatedRoute, 
    private usersService: UsersService, 
    private postService: PostService,
    private fb: FormBuilder
    ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.modalElement = document.querySelector('.modal');
    M.Modal.init(this.modalElement, {});

    this.InitEditForm();

    this.postsTab = true;
    const tabs = document.querySelector('.tabs');
    M.Tabs.init(tabs, {});
    this.tabElement = document.querySelector('.nav-content');

    this.route.params.subscribe(params => {
      this.name = params.name;
      this.GetUserData(this.name);
    });

    this.socket.on('refreshPage', () => {
      this.GetUserData(this.nameFromUserData);
    });
  }

  ngAfterViewInit() {
    this.tabElement.style.display = 'none';
  }

  InitEditForm() {
    this.editForm = this.fb.group({
      editedPost: ['', Validators.required]
    });
  }

  GetUserData(name) {
    this.nameFromUserData = name;
    this.usersService.GetUserByName(name).subscribe(data => {
      this.user = data.result;
      this.posts = data.result.posts.reverse();
      this.following = data.result.following;
      this.followers = data.result.followers;
    }, 
    err => console.log(err));
  }

  OpenEditModal(post) {
    this.postValue = post;
  }

  SubmitEditedPost() {
    const body = {
      id: this.postValue.postId._id,
      post: this.editForm.value.editedPost
    }
    this.postService.EditPost(body).subscribe(data => {
      this.socket.emit('refresh', {});
    }, 
    err => console.log(err)
    );
    M.Modal.getInstance(this.modalElement).close();
    this.editForm.reset();
  }

  CloseModal() {
    M.Modal.getInstance(this.modalElement).close();
    this.editForm.reset();
  }

  DeletePost() {
    this.postService.DeletePost(this.postValue.postId._id).subscribe(data => {
      this.socket.emit('refresh', {});
    }, 
    err => console.log(err)
    );
    M.Modal.getInstance(this.modalElement).close();
    this.editForm.reset();
  }

  ChangeTab(value) {
    if(value === 'posts') {
      this.postsTab = true;
      this.followersTab = false;
      this.followingTab = false;
    }

    if(value === 'following') {
      this.postsTab = false;
      this.followersTab = false;
      this.followingTab = true;
    }

    if(value === 'followers') {
      this.postsTab = false;
      this.followersTab = true;
      this.followingTab = false;
    }
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

}
