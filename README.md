# A Canvas Based Popup

This is a popup Web Component that uses a canvas to render the shape of a popup underneath the actual popup content. You might be wondering what the point of this is when you can easily achieve the same thing in web using a pseudo-element. I wanted a popup element where the background and pointer were all one shape. This gives you better background and border color support with no obvious separation between the arrow and main body.

You can define the popup in markup like so:

```html
<c-popup id="popup">
    <div>
        Content
    </div>
</c-popup>
```