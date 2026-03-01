---
title: "Running with Fusion can be Dangerous…"
date: 2010-12-16
description: "Exploring game development with Multimedia Fusion — early prototyping experiments."
tags: ["Indie Game Blog"]
image: "/images/wp-imports/gamedev/fusion_run4export.gif"
draft: false
---

{{< youtube "hz-FkeqklmI" >}}

My study/work in progress vlog

I have spent the last couple of days studying run cycles for an indie game that I have been working on.  I have done a lot of work animating in the past, and in particular the run cycle.  For me it’s a hard thing to wrap your head around, because there are many right ways to do it, as well as many wrong.

The best reference literature for animating is, “The Animator’s Survival Kit” by Richard Williams.

[![The Animator's Survival Kit, Expanded Edition: A Manual of Methods, Principles and Formulas for Classical, Computer, Games, Stop Motion and Internet Animators](http://ecx.images-amazon.com/images/I/51dLT%2BUNshL._BO2,204,203,200_PIsitb-sticker-arrow-click,TopRight,35,-76_AA300_SH20_OU01_.jpg)](http://ecx.images-amazon.com/images/I/51dLT%2BUNshL._BO2,204,203,200_PIsitb-sticker-arrow-click,TopRight,35,-76_AA300_SH20_OU01_.jpg)

#

## Fusion Run

This particular study focused on a 10 frame run cycle very much like the one used by Samus in Metroid Fusion.  10 frames is odd, and that is why the study interested me so.  Usually walks are 6(12) frames, or 8(16) frames.

![Image hosted by Photobucket.com](http://i10.photobucket.com/albums/a135/samusaran99/Fusion-Samus-Running.gif)

Normal Run
1. Contact - 2. Low - 3. Pass - 4. High - 5. Contact - 6. Low - 7. Pass - 8. High

Fusion Run works like this
1. Contact - 2. Low - 3. Pass - 4. High -  5. Momentum - 6. Contact - 7. Low - 8. Pass - 9. High - 10. Momentum

I labeled the extra frame as "extreme" initially because the legs are stretched to their extent.  It is important to note that the frame could easily be called the "pre-contact" frame, as it so closely precedes the contact frame.

Not quite satisfied with those initial observations, I thought better of the naming. Since it is clear that character at this point has stopped exerting energy to push forward he is letting the momentum follow through, thus it is more appropriate to name the extra frame as as such.

#

## Smart Objects

Along the way I found out about “Smart Objects” in Photoshop.  Smart objects are amazing.

Smart objects allow me to place a reference layer within a document.  This is primarily used for Web Design, so that if you make touchups to say, a logo, or a button; The instance edited is updated throughout the design automatically.

Check out this handy tutorial if you want to know more about how to use Smart Objects.

{{< youtube "wnPrZZ1e0Zg" >}}

An excellent Smart Objects Tutorial I found on the web!

Through the use of smart objects I created what could be akin to an Animation Rig, only much much more limited.  The idea is that by splitting up basic parts of a character, you can move them independently to make fixes easier.  Flash users are very fimilar with this method of animating.

## Tweening

In fact, whole games use this method of animation their sprites, it is referred to as Interpolation, and if you use flash it would be equivalent to Tweening.

{{< youtube "GzTovZhrPpQ" >}}

Muramasa is a good example of excellent interpolation combined with smooth traditional transitions.

{{< youtube "0SNnlvjWuYo" >}}

Another Fantastic use of ‘tweening’ - Beware: FOR MATURE AUDIENCE ONLY.

{{< youtube "IyZJo7RpCwo" >}}

Aquaria–an indie game that uses interpolation, perhaps too much.

Above are examples of games that use the method to save production time and to create a “smoother” animation.  I personally find much of this kind of animation distracting.  They usually feel like paper dolls moving.  Muramasa is an excellent execution of the practice, while Aquaria suffers the most from the paper doll effect.

## Conclusion

So what does all this have to do with my study?  Well by using Smart objects to designate body pieces I was able to then create 10 frame animation by manipulating the parts.  The parts themselves are Smart objects, so, I can simply update or hide layers within a Smart Object source to change the entire character, without having to manipulate any of of the Animation frames.

While this isn’t practical for a final sprite, it provides a time saving method for mechanic and play testing, while also giving me an excelling draft of the final sprite that I need only touch up in order to produce a production quality asset.

[![Fusion_Run4export](/images/wp-imports/gamedev/fusion_run4export_thumb.gif "Fusion_Run4export")](/images/wp-imports/gamedev/fusion_run4export.gif)        [![Fusion_Run4export2[3]](/images/wp-imports/gamedev/fusion_run4export23_thumb.gif "Fusion_Run4export2[3]")](/images/wp-imports/gamedev/fusion_run4export23.gif)

Thanks for your interested!  Stay tuned for more art fun!

## Side Notes

I also learned [How to use Smart Guides in Photoshop](http://www.associatedcontent.com/video/13417/how_to_use_smart_guides_in_photoshop.html?cat=59), as well as [How to Create and Use Clipping Masks in Photoshop](http://www.elated.com/articles/creating-and-using-photoshops-clipping-masks/).
