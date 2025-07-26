import express from 'express';
import { GitHubApi } from 'utils/apis';

export type Release = {
  tag_name: string;
}

export abstract class Tracer {
  protected constructor(public lang: string) {
    this.update().catch(console.error);
  }

  abstract build(release?: Release): Promise<any>;

  abstract route(router: express.Router): void;

  async update(release?: Release) {
    if (release) {
      console.log(`tracer ${this.lang} release, tag: ${release.tag_name}`)
      return this.build(release);
    }
    try{
      const {data} = await GitHubApi.getLatestRelease('algorithm-visualizer', `tracers.${this.lang}`);
      console.log(`tracer ${this.lang} release, tag: ${data.tag_name}`)
      return this.build(data);
    }catch(ex){
      console.log(`Failed to update ${this.lang} with error ${ex}`)
      return this.build()
    }
      
  }
}
