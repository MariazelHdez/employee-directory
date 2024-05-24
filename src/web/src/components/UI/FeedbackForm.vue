<template>
  <v-container class="container-content">
    <div class=" mb-5 container text-center">
      <img src="/Aurora-mini.svg" style="margin: 5% 0px 3% 0px" height="44" />
    </div>
    <div class="pt-6 z-i" style="border-top:1px solid #d4c7cf;">
      <div class="d-flex align-center">
        <h4 class="mr-4 help" style="font-weight:500;">{{ $t("components.feedback_form.questions.helpful_message")}} *</h4>
        <div @click="startForm(1)" class="icon mr-4">
          <IconLoader :color="colorCheck === 1 ? 'selected' : 'unselected'" height="33" :image="'thumbs up'" />
        </div>
        <div @click="startForm" class="icon mr-4">
          <IconLoader @click="startForm(2)" :color="colorCheck === 2 ? 'selected' : 'unselected'" class="icon" height="33"
            :image="'thumbs down'" />
        </div>
      </div>
    </div>
    <v-form ref="feedbackForm" @submit.prevent="sendEmail" v-if="formStatus" class="pt-8">
      <h4 class="help">{{ feedbackCheck === 1 ? $t("components.feedback_form.questions.how_help_you_message") + ' *' : $t("components.feedback_form.questions.how_improve_message") + ' * ' }}
      </h4>
      <v-textarea v-model="feedbackText" outlined class="mt-4 area" background-color="#f1f1f1" rows="5">

      </v-textarea>
      <v-btn id="submit-feedback" type="submit" class="btn px-7" tonal elevation="0" height="60px" color="#00616D">{{ $t("components.feedback_form.buttons.submit_feedback") }}</v-btn>
    </v-form>

    <v-card class="feedback-form form-success my-4 pa-4 help d-flex align-center" v-if="success">
      <IconLoader @click="startForm(2)" :color="'success'" class="icon mr-3" height="16" :image="'success'" />
      <p class="ma-0">
        {{ $t("components.feedback_form.alerts.thanks_feedback") }}
      </p>
    </v-card>
    <v-card class="feedback-form form-error my-4 pa-4 help d-flex align-center" v-if="feedbackError">
      <p class="ma-0">
        {{ feedbackCheck === 1 ? $t("components.feedback_form.questions.how_help_you_message") + ' *' : $t("components.feedback_form.questions.how_improve_message") + ' * ' }}
        {{ $t("components.feedback_form.alerts.field_is_required") }}
      </p>
    </v-card>
    <v-card class="feedback-form form-error my-4 pa-4 help d-flex align-center" v-if="requestError">
      <p class="ma-0">
        {{ errorMessage }}.  {{ $t("components.feedback_form.alerts.try_again") }}
      </p>
    </v-card>
  </v-container>
</template>

<script>

const axios = require("axios");

import * as urls from "../../urls";

import IconLoader from '../icons/IconLoader.vue';



export default {
  data() {
    return {
      formStatus: false,
      feedbackCheck: 0,
      colorCheck: 0,
      feedbackText: '',
      feedbackError: false,
      success: false,
      requestError: false,
      errorMessage: '',
    }
  },
  components: {
    IconLoader
  },
  watch: {
    feedbackCheck() {
      if (this.feedbackCheck === 1) {
        this.colorCheck = 1
      } else this.colorCheck = 2
    },
    feedbackText() {
      if (this.feedbackText !== '') {
        this.feedbackError = false
      }
    },
    success() {
      if (this.success === true) {
        setTimeout(() => {
          this.success = false
        }, "3000")
      }
    },
    requestError() {
      if (this.requestError === true) {
        setTimeout(() => {
          this.requestError = false
        }, "10000")
      }
    }
  },
  methods: {
    startForm(type) {
      this.formStatus = true;
      if (type === 1) {
        this.feedbackCheck = 1
      } else this.feedbackCheck = 2
    },
    sendEmail() {
      if (this.feedbackText === '') {
        this.feedbackError = true
        return
      } else {

        let emailSubject = '';

        const pageUrl = window.location.href;

        if (this.feedbackCheck === 1) {
          emailSubject = 'How did this page help you?'
        } else emailSubject = 'How can we improve this page?'

        axios
          .request({
            method: 'POST',
            data: {
              emailSubject: emailSubject,
              emailBody: this.feedbackText,
              pageUrl: pageUrl
            },
            url: `${urls.EMPLOYEES_URL}feedbackForm`
          }
          )
          .then((resp) => {
            console.log(resp)
            if (resp) {
              this.formStatus = false, this.success = true, this.colorCheck = 0, this.feedbackText = ''
            }
          })
          .catch((err) => {
            this.requestError = true;
            this.errorMessage = err;
            console.error(err)
          });
      }
    }
  },
}

</script>

<style>
.v-btn#submit-feedback{
  text-transform: none;
}
.btn {
  color: white !important;
  border: none !important;
}

.area {
  border: #ccc !important;
}

.icon {
  cursor: pointer;
}

.help {
  font-size: 16px !important;
  font-weight: 500 !important;
}

.form-success {
  border-left: #278400 5px solid !important;
  background-color: #dbedcf !important;
}

.feedback-form {
  border-bottom: none !important;
  border-right: none !important;
  border-top: none !important;
  border-radius: 0 !important;
  font-size: 16px !important;
}

.form-error {
  border-left: #a94442 5px solid !important;
  background-color: #f3e9e8 !important;
}

.form-error p {
  color: #a94442 !important;
}
</style>