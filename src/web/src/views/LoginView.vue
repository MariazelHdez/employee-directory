<template>
    <div>
		<h2>{{ title }}</h2>
		<p>
			The authentication for this application is managed by our authentication
			partner Vivvo. When you click the button below, you will be redirected to
			their site and once authenticated, back here.
		</p>
		<p>
			If you have already authenticated with Vivvo and your session is still
			active, it may skip the sign in process and return you here immediately.
		</p>
		<v-alert
			v-if="loginFailed"
			dense
			text
			type="error"
		>
			Authentication failed. <strong>Email does not exist</strong>. Please try signing in again.
		</v-alert>
        <v-btn color="primary" @click="redirect">
            Click here to sign in
        </v-btn>
	</div>
</template>

<script>
import { LOGIN_URL } from '../urls';

export default {
    data() { 
        return {
            title: "Sign in to Employee Directory",
			loginFailed: false,
        }
    },
	created() {
        const params = new URLSearchParams(window.location.search);
        this.loginFailed = params.get('loginFailed') === 'true';
    },
	methods: {
		redirect() {
  			window.location.href = LOGIN_URL;
		}
	}
}
</script>