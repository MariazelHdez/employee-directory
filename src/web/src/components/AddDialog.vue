<template>
  <v-row justify="center">
    <v-dialog :value="dialog" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ title }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <slot name="inputs"></slot>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="close">
            Close
          </v-btn>
          <v-btn color="blue" text @click="save">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      
    }
  },
  props: {
    title: String,
    dialog: Boolean,
    save: Function,
    close: Function,
  },
  methods: {

  }
};
</script>