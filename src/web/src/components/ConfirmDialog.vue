<template>
    <v-dialog v-model="show" persistent max-width="400px">
        <v-card>
            <v-card-title>{{ params.title }}</v-card-title>
            <v-card-text>{{ params.message }}</v-card-text>
            <v-card-actions>
                <v-btn @click="doDeny">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="doConfirm">Confirm</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        show: Boolean,
        params: Object,
        cancel: Function,
        accept: Function,
    },
    methods: {
        doConfirm() {
            this.accept();
        },
        doDeny() {
            this.cancel();
        },
    },
};
</script>
