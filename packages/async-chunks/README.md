# `@shopify/async-chunks`

[![Build Status](https://travis-ci.org/Shopify/quilt.svg?branch=master)](https://travis-ci.org/Shopify/quilt)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md) [![npm version](https://badge.fury.io/js/%40shopify%2Fasync-chunks.svg)](https://badge.fury.io/js/%40shopify%2Fasync-chunks.svg)

A code splitting & server side rendering solution for universal react apps running on a Koa server.

## Installation

```bash
$ yarn add @shopify/async-chunks
```

## Usage

This package provides all the tools required to get your app code splitting & server side rendering in harmony:

- A webpack plugin to generate a manifest of all your asynchronous chunks. This is generated a build time and consumed at runtime to determine which chunks need to be SSR'd.

- A babel plugin that injects metadata about a given chunk. This metadata is used to then determine which async chunks to SSR.

- A HOC to generate your code splits that can then be SSR'd in your app.

- A Koa middleware that parses the manifest without any performance overhead.

- Utilities to preload chunks on the server and pick up the SSR'd chunks on the client.
