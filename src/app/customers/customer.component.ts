import { Component, OnInit } from '@angular/core';
import { Customer } from './customer';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormArray,
} from '@angular/forms';

function emailMatcher(c: AbstractControl) {
  let emailControl = c.get('email');
  let confirmControl = c.get('confirmEmail');
  if (emailControl.pristine || confirmControl.pristine) {
    return null;
  }
  if (emailControl.value === confirmControl.value) {
    return null;
  }
  return { match: true };
}

// function ratingRange(c:AbstractControl):{[key:string]:boolean}|null{
//    if(c.value !=undefined &&(isNaN(c.value) || c.value<1 || c.value>5)){
//      return{'range':true};
//    };
//    return null;
// };

//it's better because we can use parameter
function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (
      c.value != undefined &&
      (isNaN(c.value) || c.value < min || c.value > max)
    ) {
      return { range: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();
  emailMessage: '';

  //for duplicate data
  get addresses(): FormArray {
    return <FormArray>this.customerForm.get('addresses');
  }

  private validationMessages = {
    required: 'Please enter your email address.',
    pattern: 'Please enter a valid email adress.',
  };
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: [, [Validators.required, Validators.maxLength(50)]],
      // lastName: {value:'n/a', disabled:true},
      emailGroup: this.fb.group(
        {
          email: [
            '',
            [
              Validators.required,
              Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+'),
            ],
          ],
          confirmEmail: ['', Validators.required],
        },
        { validator: emailMatcher }
      ),

      phone: '',
      notification: 'email',
      rating: ['', ratingRange(1, 5)],
      sendCatalog: true,
      // addresses: this.buildAddress(),
      addresses: this.fb.array([this.buildAddress()]),
    });
    //+ замість функцій при кліку на кожен елемент
    this.customerForm
      .get('notification')
      .valueChanges.subscribe((value) => this.setNotification(value));
  }

  save() {
    console.log(this.customerForm);
    console.log('Saved:', this.customerForm.value);
  }

  populateTestData(): void {
    //set ALL default values
    // this.customerForm.setValue({
    //   firstName: 'Jack',
    //   lastName: 'Smith',
    //   email: 'jack@smith.com',
    //   sendCatalog: false,
    // });

    //set SOME default values
    this.customerForm.patchValue({
      firstName: 'Jack',
      lastName: 'Smith',
      emailGroup: {
        email: 'jack@smith.com',
        confirmEmail: 'jack@smith.com',
      },
      phone:'911',
      rating:'1',
      sendCatalog: false,
    });
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  buildAddress(): FormGroup {
    return this.fb.group({
      adressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
    });
  }

  addAddress(): void {
    this.addresses.push(this.buildAddress());
  }
}
