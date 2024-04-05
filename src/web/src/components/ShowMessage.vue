<template>
    <div class="text-center">
    <v-snackbar
        v-model="show"
        :color="snackbarColor"
    >
        {{ snackbarMessage }}

        <template v-slot:action="{ attrs }">
        <v-btn
            color="red"
            text
            v-bind="attrs"
            @click="clearSnackBar"
        >
            Close
        </v-btn>
        </template>
    </v-snackbar>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            show: false
        };
    },
    computed: {
        ...mapGetters([
            "snackbar",
            "snackbarMessage",
            "snackbarColor"
        ]),
    },
    methods: {
        ...mapActions({
            clearSnackBar: "clearSnackBar"
        }),
    },
    watch: {
        snackbar() {
            this.show = this.snackbar;
        },
        show(newVal) {
            if (!newVal) {
                this.clearSnackBar();
            }
        },
    }
};
</script>